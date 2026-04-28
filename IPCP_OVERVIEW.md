# IPCP — System Overview

**IPCP** (Ingestion Portal and Content Processing Platform) is Cast & Crew's automated payroll-document processing system for the entertainment industry. It ingests PDF documents (time cards, tax forms, start paperwork) from multiple sources, runs OCR and AI extraction to pull structured data from them, routes them through human review when needed, and submits the extracted data to downstream payroll systems.

The system eliminates the need for manual data entry on thousands of production payroll documents per day by combining AWS Textract OCR, template-based field extraction, and LLM-powered intelligence.

---

## Table of Contents

1. [Why It Exists](#1-why-it-exists)
2. [System Components](#2-system-components)
3. [End-to-End Pipeline](#3-end-to-end-pipeline)
4. [Database Schema](#4-database-schema)
5. [OCR Extraction: How It Works](#5-ocr-extraction-how-it-works)
6. [Document Types and Extracted Fields](#6-document-types-and-extracted-fields)
7. [Human-in-the-Loop Workflow](#7-human-in-the-loop-workflow)
8. [Destination Systems](#8-destination-systems)
9. [LLM Enhancement Layer](#9-llm-enhancement-layer)
10. [Developer Tools](#10-developer-tools)
11. [Infrastructure and Configuration](#11-infrastructure-and-configuration)
12. [Key Enumerations Reference](#12-key-enumerations-reference)

---

## 1. Why It Exists

Film and TV productions generate enormous volumes of payroll paperwork — time cards for hundreds of crew members, tax forms, direct deposit authorizations, start cards — all arriving as PDFs from multiple systems (Studio+, HoursPlus, CapsPay, HTG). Before IPCP, this data had to be manually keyed into payroll systems, which was slow, error-prone, and expensive.

IPCP automates this by:
- Accepting PDF documents from multiple upstream sources
- Running AWS Textract to get raw OCR output
- Applying form-specific templates to extract the right fields from the right positions
- Using LLMs as a fallback when template-based extraction is insufficient
- Routing documents needing human review to data entry operators
- Submitting the final structured data to FMS, HTG, CapsPay, Studio+, and other downstream payroll systems

The system is multi-tenant (each production company or payroll client is a tenant) and supports 28+ distinct form types across US and Canadian productions.

---

## 2. System Components

IPCP spans several codebases in the AI-COE repo. Together they form a complete platform:

### 2a. `ipcp-aspnetzero-core` — Core Application (DOCUHOLD EDRMS)

The primary application. Built on **ASP.NET Zero** (.NET 8, ABP Framework). This is the web application that:
- Provides the data entry / review UI
- Orchestrates the full processing pipeline via background jobs
- Manages form templates (FormPages), packets, and routing rules
- Stores all file state and audit history in SQL Server (`IPCPDEV`)
- Integrates with AWS Textract for OCR
- Sends completed data to downstream systems via SQS and REST APIs

Architecture: Domain-Driven Design, multi-tenant SaaS, event-driven background jobs.

**Key source paths:**
- `src/DOCUHOLD.EDRMS.Core` — Domain layer (entities, business logic)
- `src/DOCUHOLD.EDRMS.Application` — Application services and background jobs
- `src/DOCUHOLD.EDRMS.EntityFrameworkCore` — EF Core data access / migrations
- `src/DOCUHOLD.EDRMS.Web.Host` — ASP.NET Core API host
- `src/DOCUHOLD.EDRMS.Web.Public` — Public-facing web interface

### 2b. `ipcp-tools/llm-model` + `ipcp-tools/ipcp-llm-processing-server` — LLM Extraction Engine

A Python FastAPI service that adds an AI layer on top of the core pipeline. It:
- Accepts a `document_id` (GUID from `IncomingFileDetails`)
- Fetches the PDF from S3 and the OCR JSON from SQL Server
- Runs a multi-stage extraction pipeline combining Textract data and an Ollama-hosted GGUF LLM
- Caches results in SQLite (`llm_cache.db`) so repeat requests are instant
- Returns a structured `dto_information` JSON matching the same format the .NET app expects

This is the AI upgrade path: when template-based extraction in the .NET core leaves fields empty, the LLM processing server can fill them in.

**Deployment:** Docker Compose stack — `nginx` → `processing-server` (FastAPI) → `model-server` (FastAPI + llama-cpp) → `ollama` (GPU/CPU inference)

### 2c. `ipcp-tools/dashboard` — Analyst Dashboard

A Flask + HTML dashboard for internal use. Provides:
- Browsing and reviewing OCR extraction results
- LLM cache management (view, invalidate, refresh)
- Document-level metrics and status breakdowns
- SQL Server connection to both DEV and PROD IPCP databases

### 2d. `ipcp-tools/textract-analyzer` — Textract Visualizer

A Flask + vanilla JS tool for debugging OCR quality. It:
- Lets you browse files from the `IncomingFileDetails` database table
- Loads the PDF from S3 and the raw Textract JSON side-by-side
- Highlights Textract blocks on the PDF with bidirectional click/hover
- Filters by block type (WORD, LINE, TABLE, KEY_VALUE_SET)

Primarily used to diagnose why a template isn't extracting certain fields correctly.

### 2e. `ipcp-tools/mcp-server` — Claude Desktop MCP Integration

An MCP (Model Context Protocol) server for use with Claude Desktop. It exposes the IPCP SQL Server database as a set of natural-language-queryable tools — no API key needed. Lets internal users ask questions like "how many files completed OCR today?" and get live answers from the database.

### 2f. `ipcp-tools/metrics_analysis` — Metrics Scripts

Python scripts for running analytical SQL queries against the IPCP database and exporting results to CSV, Excel, or PDF. Useful for performance reporting on OCR success rates, throughput, error patterns, etc.

---

## 3. End-to-End Pipeline

```
[Upstream Source]
  Studio+, HoursPlus, CapsPay, HTG
         │
         │  Upload PDF to AWS S3
         │  Send SQS notification
         ▼
[ProcessMessageBackgroundJob]  (.NET)
  - Reads SQS message
  - Creates record in PayloadLogs
  - Creates record in IncomingFileDetails (FileStatus = OcrRequired)
  - Submits PDF to AWS Textract
  - Updates FileStatus = OcrInProgress
         │
         │  Textract processes async (seconds to minutes)
         │  Sends completion notification to a second SQS queue
         ▼
[OcrStatusCheckBackgroundJob]  (.NET)
  - Polls Textract result SQS queue
  - On SUCCEEDED: stores result, updates FileStatus = OcrCompleted
  - On FAILED: updates FileStatus = OcrFailed
         │
         ▼
[SortingManager]  (.NET)
  - Identifies form type using SearchJsonString keywords in FormPages
  - Selects the correct template (ConfigurationSettingsJson)
  - For each page: calls AWSOCRManager.GetOcrInformationByFormPageAsync()
  - Stores extracted field values in SortedFileInformation.DtoInformation (JSON)
  - Sets FileStatus = SortingCompleted or SortingFailed
         │
         ▼
[Assessment / Routing]
  - OcrConfidenceScore determines FileAssessmentType:
      ≥95% extraction  →  NoHumanInLoop  (fully automated)
      80–95%           →  MinHumanInLoop (quick review)
      <80%             →  FullHumanInLoop (full manual entry)
  - Automated path skips to Submission
  - Human path enters DataEntry queue
         │
         ▼
[Human Review UI]  (if required)
  - Data entry operators review and correct extracted fields
  - ReviewComments table captures notes
  - FileStatus transitions: DataEntryRequired → DataEntryInProgress → DataEntryCompleted
         │
         ▼
[Submission / OutgoingPayload]
  - Formats extracted DTO into destination-specific payload
  - Sends to: FMS, HTG, CapsPay, Studio+, ETC, CNCPayroll
  - Records in OutgoingPayload table
  - FileStatus = Submitted or SubmissionFailed (with retry)
```

### File Status State Machine

Each file is a **single record** in `IncomingFileDetails`. The `FileStatus` field changes over time — records are never duplicated across statuses.

```
0   OcrRequired          → Initial state after file received
1   OcrInProgress        → Textract job submitted
2   OcrFailed            → OCR processing failed (no retry by default)
3   OcrCompleted         → OCR successful
4   DataEntryRequired    → Needs human data entry
5   DataEntryInProgress  → User is editing
6   DataEntryCompleted   → User submitted
7   ValidationInProgress → System validating
8   ValidationCompleted  → Validation passed
9   Submitted            → Sent to destination
10  SubmissionFailed     → Destination rejected; can retry
21  SortingFailed        → Automatic sorting failed
22  SortingCompleted     → Successfully sorted
```

---

## 4. Database Schema

### Primary Database: `IPCPDEV` (SQL Server at 10.162.4.41)

This is the main application database. All file state lives here.

#### Core Tables

**`PayloadLogs`**
Tracks the raw incoming payload from upstream systems. Every document begins here.
- `Id` (GUID) — primary key
- `Source` — enum: Studio=1, HoursPlus=2, IPCP=3, CapsPay=4, ETC=5, CNCPayroll=6, HTG=7
- `Payload` — raw JSON payload from the source system
- `PayLoadStatus`, `SourcePayloadStatus`, `DestinationPayloadStatus` — lifecycle status enums

**`IncomingFileDetails`**
The master record for every document. One row = one file. Never duplicated.
- `Id` (GUID) — primary key
- `FileKeyName` — business key (links to S3 object key)
- `FileStatus` — enum (see state machine above)
- `FileType` — form type enum (TimeCard, I9, W4, DirectDeposit, etc.)
- `FileSource` — which upstream system sent it
- `OCRJobId` — AWS Textract job ID
- `OcrConfidenceScore` — average OCR confidence (0–100)
- `OCRInfoPath` — S3 path to the raw Textract JSON
- `TemplateId` — which extraction template was used
- `SortingInfo` — JSON metadata from the sorting process
- `FileAssessmentType` — NoHumanInLoop / MinHumanInLoop / FullHumanInLoop
- `Exception` — error message if processing failed
- `ClientNumber`, `ProducerNumber`, `ProdcoNumber`, `ProjectNumber` — production hierarchy
- `DataEntryStartDateTime`, `OCRCompletedDateTime`, `SystemSortCompletedDateTime`, `DataEntrySubmittedDateTime` — timestamps for each stage
- `IsDeleted` — soft delete flag (never hard-delete)
- `PayloadLogId` (FK → PayloadLogs)

**`RejectedFileDetails`**
Files that failed processing or were rejected by a downstream system. Separate table — **do not sum with IncomingFileDetails** to get totals (potential double-counting by `FileKeyName`).
- Links back to `IncomingFileDetails` via `FileKeyName` (no FK — business key join only)

**`SortedFileInformation`**
Stores the extracted field data after OCR + template processing. One record per page/form in a document.
- `IncomingFileDetailId` (FK → IncomingFileDetails)
- `DtoInformation` — JSON blob containing all extracted field values
- `ReviewPayload` — JSON reviewed/corrected values from human data entry
- `OutgoingPayload` — JSON formatted for the destination system
- `FormType` — which form type this page was classified as
- `PageNo` — page number within the source document
- `IsReviewed` — whether a human reviewed this record
- `IsDERequired` — whether data entry is required

**`OutgoingPayload`**
Every payload sent to a destination system. One file can have multiple outgoing payloads (different destinations).
- `IncomingFileId` (FK → IncomingFileDetails)
- `Destination` — enum: FMS=1, CAPS=2, ETC=3, CNCPAYROLL=4, STUDIOPLUS=5, HTG=6
- `PayloadData` — JSON payload that was sent
- `Status` — delivery status
- `RetryCount` — how many times it was attempted

**`FormPages`**
Template configuration table — defines how to extract data from each form type. This is the key configuration driving the entire extraction process.
- `FormType` — which form type this template applies to
- `TemplateId` — version of the template
- `SearchJsonString` — keywords used to identify/classify this form
- `ConfigurationSettingsJson` — the extraction template (see Section 5)
- `FormPageCategory` — classification of the page within the form

**`FormPageOverrides`**
Per-client overrides to FormPages templates. Allows a specific client/project/producer to use a custom template for a given form type.

**`ReviewComments`**
Notes attached to a file during human review.
- `IncomingFileDetailId` (FK → IncomingFileDetails)
- `Comment` — reviewer's note
- `Section` — which section of the form the comment refers to

**`Projects`**
Production project master data (project number, client, producer, prodco hierarchy).

**`Packets`**
A packet is a collection of form pages that travel together to a destination.

**`PacketMappings`**
Maps form pages to packets. Defines which forms belong in which submission packet.

#### Table Relationships (cardinality)

```
PayloadLogs ──(1:many)──> IncomingFileDetails
IncomingFileDetails ──(1:many)──> SortedFileInformation
IncomingFileDetails ──(1:many)──> OutgoingPayload
IncomingFileDetails ──(1:many)──> ReviewComments
IncomingFileDetails ──(no FK)──> RejectedFileDetails  [via FileKeyName]
FormPages ──(1:many)──> SortedFileInformation
Packets ──(1:many)──> PacketMappings ──> FormPages
```

#### ABP Framework System Tables (auto-managed)

The ABP framework adds ~30 system tables for auditing, identity, multi-tenancy, and permissions. The most relevant:

- `AbpAuditLogs` — records every API call and method execution with full parameters
- `AbpEntityChanges` / `AbpEntityPropertyChanges` — field-level change history (old value → new value) for audited entities
- `AbpUsers`, `AbpRoles`, `AbpTenants` — identity and multi-tenant management
- `AbpBackgroundJobs` — queue for background processing jobs

The `Parameters` column in `AbpAuditLogs` was extended to `nvarchar(max)` (from 1024) to handle large payload logging.

### Secondary Database: `Caps_Pay_Payroll_Test` (SQL Server at 10.162.20.137)

Read-only connection to CAPSPay. The IPCP application reads client and project data from here to validate and enrich incoming payroll documents.
- `CapsPay.Cl_Client` — client master data
- `CAPSPay.Cl_Project` — project master data

---

## 5. OCR Extraction: How It Works

Extraction happens in `AWSOCRManager.GetOcrInformationByFormPageAsync()`. Given a set of Textract `Block` objects (the raw OCR output for one page) and a template from `FormPage.ConfigurationSettingsJson`, it returns a dictionary of field name → extracted value.

### The Template Format

Each `FormPage` has a `ConfigurationSettingsJson` that looks like this:

```json
{
  "Properties": [
    {
      "Name": "EmployeeName",
      "Key": "Name|Employee Name|Full Name|Employee's Full Name",
      "MinX": "0.05",
      "MinY": "0.12",
      "MaxX": "0.45",
      "MaxY": "0.20"
    },
    {
      "Name": "WeekEnd",
      "Key": "Week End|Week Ending|W/E|Period Ending",
      "MinX": "0.55",
      "MinY": "0.12",
      "MaxX": "0.90",
      "MaxY": "0.20"
    }
  ]
}
```

Each property has:
- `Name` — the field name in the output DTO
- `Key` — pipe-separated list of label keywords to look for (e.g., the text printed before a fill-in field)
- `MinX/MinY/MaxX/MaxY` — normalized bounding box coordinates (0.0–1.0) for coordinate-based fallback

### Two Extraction Methods

**Method 1 (Primary): Keyword / Key-Value Pair Matching**

AWS Textract detects form fields as `KEY_VALUE_SET` blocks — it pairs a label block (e.g., "Employee Name:") with its value block (e.g., "John Smith"). The extraction logic:
1. Builds a dictionary of all `{label → value}` pairs Textract found
2. For each template property, checks whether any of its `Key` variations match a label in that dictionary
3. If matched, uses the associated value

Checkboxes are handled as a special case — Textract returns `SELECTION_ELEMENT` blocks with `SelectionStatus = SELECTED / NOT_SELECTED`.

**Method 2 (Fallback): Coordinate-Based Extraction**

If no keyword match is found, the system falls back to looking for `WORD` blocks within the bounding box defined by `MinX/MinY/MaxX/MaxY`. This works well for fixed-layout forms where field positions are consistent.

Coordinates are normalized (0.0 = left/top edge, 1.0 = right/bottom edge), making templates resolution-independent.

**Priority:** Keyword matching first → coordinate fallback → empty string (never throws an exception for a missing field).

### Assessment Types (Automation Level)

After extraction, the system determines how much human review is needed based on extraction completeness and OCR confidence:

| Assessment Type | Condition | What Happens |
|---|---|---|
| `NoHumanInLoop` | ≥95% fields extracted, high OCR confidence | Submitted automatically |
| `MinHumanInLoop` | 80–95% extraction | Quick human review of missing fields |
| `FullHumanInLoop` | <80% extraction or low OCR confidence | Full manual data entry |
| `ReviewOnly` | Data pre-populated (e.g., from CapsPay API) | Human reviews for accuracy only |

---

## 6. Document Types and Extracted Fields

The system processes 28+ form types. Here are the primary ones:

### Time Cards (most common)
Employee and production info plus daily time breakdown. Key fields:
- **Employee:** FirstName, LastName, SSN, Title, Union, LoanOut
- **Production:** ProductionCompany, Project, PayCo, WeekEnd
- **Pay:** PayRate, GuarHoursPerDay, TaxState, WorkLocation, GrandTotal
- **Daily time entries (per day):** Date, CallTime, LunchStart/End, DinnerStart/End, WrapTime, TotalWorkHours, PayRateMultiplier (1x–3x), Zone, Location, ProdEpiNumber

Variants: Showbiz Timecard, SAG Timecard (4 formats), Paying Agent Timecard, Canadian Crew Timecard (5 types), ACTRA Timecard, union-specific formats.

### I-9 (Employment Eligibility Verification)
- Employee: Name, SSN, DOB, Address, Phone, Email
- Citizenship status: US Citizen / National / Permanent Resident / NRA
- Document details: AlienRegistrationNumber, NRAExpiryDate
- Signatures: EmployeeSignature, EmployeeSubmitDate, EmployerSignature, EorHireDate

### W-4 (Federal Tax Withholding)
- Name, SSN, Address
- Filing status (Single / Married / HeadOfHousehold)
- IsMultipleJobs, DependentAmount, OtherIncome, Deductions, AdditionalWithholding, Exempt

### W-9 (Taxpayer Identification)
- Name, CorporationName, SSN or EIN
- Corporation type (Individual / C-Corp / S-Corp / Partnership / LLC / Trust)

### Direct Deposit
- Employee name, SSN, ActivationDate
- Bank: BankName, RoutingNumber, AccountType (Checking/Savings), SplitAmount/Percentage, IsDDTermination

### Start Card / Start Paperwork
New employee onboarding. Variants: Individual, Loan-Out, Union, Employee.

### Other Forms
Box Rental, Mileage Reimbursement, 401K, Voided Check, LOI (Loan-Out Information), TRF1065, Approval Emails, State W-4 forms.

---

## 7. Human-in-the-Loop Workflow

When a document requires review (`MinHumanInLoop` or `FullHumanInLoop`), it enters the data entry queue:

1. `FileStatus` → `DataEntryRequired`
2. A data entry operator opens the document in the IPCP web UI
3. The UI shows the PDF alongside pre-populated extracted fields from `SortedFileInformation.DtoInformation`
4. Operator corrects any wrong or missing values
5. Corrections are saved to `SortedFileInformation.ReviewPayload`
6. `FileStatus` → `DataEntryCompleted`
7. System validates the completed data
8. `FileStatus` → `ValidationCompleted` → `Submitted`

`ReviewComments` captures any notes the operator leaves on specific sections (flagging ambiguous handwriting, damaged pages, etc.).

If a file is outright rejected (wrong document type, illegible, duplicate), it moves to `RejectedFileDetails` with the rejection reason.

---

## 8. Destination Systems

Processed payroll data is submitted to one or more of these downstream systems via `OutgoingPayload`:

| Destination | System | What Gets Sent |
|---|---|---|
| **FMS** | Film Management System | Time card data, start paperwork |
| **CAPS / CAPSPay** | Cast & Crew payroll system | Tax forms (W-4, I-9, W-9), Direct Deposit |
| **HTG** | Hot to Go payroll | Timecards and tax forms |
| **Studio+** | Cast & Crew's production platform | Document references, processing status |
| **ETC** | Entertainment Technology Center | Forms |
| **CNCPayroll** | CNC Payroll system | Payroll data |

Each destination has its own payload format. `OutgoingPayload.PayloadData` stores the destination-specific JSON. `RetryCount` tracks delivery attempts (up to 3 retries on failure).

---

## 9. LLM Enhancement Layer

The `ipcp-llm-processing-server` adds an AI layer that handles documents where template-based extraction leaves too many fields empty. It is a separate service from the .NET core application.

### Why It Exists

Template-based extraction works well for standardized, machine-printed forms with consistent layouts. It fails when:
- Forms have non-standard layouts or vary across production companies
- Fields are near-but-not-exactly at the expected coordinates
- Labels don't exactly match the template keywords
- Handwritten or partially-filled forms

The LLM layer addresses this by sending the raw OCR text and document structure to a locally-hosted LLM and asking it to identify and extract the fields in a structured way.

### Architecture

```
[Caller] → POST /extract {document_id, environment}
              │
              ▼
[processing-server] (FastAPI, port 8080)
  ① Check llm_cache.db — HIT: return immediately
  ② MISS: fetch file metadata from SQL Server (IncomingFileDetails)
  ③ Download PDF + Textract JSON from S3
  ④ Get page templates from SQL Server (SortedFileInformation)
  ⑤ Run AWS Textract if needed (textract_helper.py)
  ⑥ Send text + structure to model-server → POST /prompt
  ⑦ Parse LLM response into DTO format
  ⑧ Save to llm_cache.db
  └→ Return dto_information JSON
              │
              ▼
[model-server] (FastAPI + llama-cpp-python, port 8000)
  Hosts GGUF model (Qwen2.5-7B or fine-tuned variant)
  Accepts prompt → returns completion
              │
              ▼
[ollama] (port 11434) — GPU/CPU inference backend
```

### Caching and Job Queue

Because LLM inference is slow (seconds to minutes per document), all extraction is async:
- First request for a document returns `202 Accepted` with a `job_id`
- Caller polls `GET /jobs/{job_id}` until `status == "done"`
- Subsequent requests for the same document return `200` from cache instantly

Background pre-caching runs overnight (configurable via `BACKGROUND_PROCESSING_START_HOUR`/`END_HOUR`) to process new documents proactively before operators arrive.

### LLM Model

The model is a locally-run GGUF (quantized) model, served via llama-cpp-python. Two options used:
- **Qwen2.5-7B-Instruct-Q4_K_M** — general-purpose, auto-downloaded from HuggingFace
- **Fine-tuned model** — custom-trained on IPCP timecard data using LoRA (`fine-tuning/` folder contains training scripts using PEFT + TRL)

The fine-tuned model uses an Alpaca instruction format (`USE_FINETUNED_FORMAT=True`) and extracts fields in a structured JSON format.

### Security

API key authentication: keys stored as SHA-256 hashes in SQLite. All requests to protected endpoints are logged to `request_log` with caller IP, key label, endpoint, document ID, response code, and duration. Auth is auto-disabled in dev mode when no keys exist.

### Environment Variables (key ones)

| Variable | Purpose |
|---|---|
| `DB_PROD_SERVER` / `DB_DEV_SERVER` | SQL Server hostname |
| `DB_PROD_NAME` / `DB_DEV_NAME` | Database name |
| `AWS_PROD_ACCESS_KEY_ID` / `AWS_PROD_SECRET_ACCESS_KEY` | S3 credentials |
| `AWS_PROD_S3_BUCKET` | S3 bucket containing PDFs |
| `LLM_MODEL_PATH` | GGUF filename to load |
| `MODEL_SERVER_URL` | Internal URL to model-server container |
| `USE_FINETUNED_FORMAT` | `True` for fine-tuned Alpaca format |
| `BACKGROUND_PROCESSING_ENABLED` | Enable off-hours pre-caching |

---

## 10. Developer Tools

### Textract Analyzer (`ipcp-tools/textract-analyzer`)

Use this when a template isn't extracting a field correctly and you need to understand why. It shows:
- The PDF rendered in the browser
- All Textract blocks overlaid on the page (click to highlight)
- Block type filter (WORD, LINE, KEY_VALUE_SET, TABLE)
- Full-text search across extracted text
- Statistics (word count, average confidence)

Can load files directly from the database (browse `IncomingFileDetails`) or by manual upload. Supports DEV/PROD environment switching.

**Start:** `bash start.sh` (starts Flask backend + opens browser)

### IPCP Dashboard (`ipcp-tools/dashboard`)

Internal analyst dashboard. Useful for:
- Reviewing document extraction results and LLM cache entries
- Monitoring processing status and throughput
- Managing LLM cache (invalidate or force-refresh specific documents)

**Start:** `python dashboard_server.py`

### MCP Server (`ipcp-tools/mcp-server`)

Natural language interface to the IPCP database via Claude Desktop. Configured in `claude_config.json` and communicates over stdio — no API key needed.

Sample queries it supports:
- "How many files have completed OCR?"
- "Show me files by status"
- "What's the OCR success rate?"
- "Show me I-9 forms processed today"

**Setup:** Add `claude_config.json` to Claude Desktop's MCP config. Requires pyodbc and SQL Server access.

### Metrics Analysis (`ipcp-tools/metrics_analysis`)

Python CLI tool for batch reporting. Runs predefined SQL queries and exports results.

```bash
python run_analysis.py --help-metrics     # list available reports
python run_analysis.py --output excel     # export to Excel
```

---

## 11. Infrastructure and Configuration

### AWS Services Used

| Service | Purpose |
|---|---|
| **S3** | Stores all PDF documents and Textract JSON results |
| **Textract** | OCR — analyzes PDFs, returns Block objects |
| **SQS** (two queues) | Queue 1: Incoming file notifications from upstream. Queue 2: Textract completion notifications back to IPCP |

### SQL Server Databases

| Database | Server | Used By |
|---|---|---|
| `IPCPDEV` | 10.162.4.41 | Main IPCP application (all file state, templates, audit) |
| `Caps_Pay_Payroll_Test` | 10.162.20.137 | Read-only CapsPay data (client/project lookup) |
| `HTGPROD` | sharedaks-prod-sqlserver-us-w2.database.windows.net | HTG errors dashboard |

### Connection Strings (from `appsettings.json` in the .NET app)

- `"Default"` → IPCPDEV
- `"CapsPayDbConn"` → Caps_Pay_Payroll_Test

### LLM Processing Server Config (`ipcp-tools/llm-model/.env`)

Copy `ipcp-tools/ipcp-llm-processing-server/.env.example` → `../llm-model/.env` and fill in credentials before running.

### Docker

The LLM processing server stack:
```bash
cd ipcp-tools/ipcp-llm-processing-server
docker compose up -d
```

Four containers: `nginx` (reverse proxy, ports 80/443), `processing-server` (port 8080 internal), `model-server` (port 8000 internal), `ollama` (port 11434 internal).

The main .NET application is deployed separately (not containerized in this repo).

---

## 12. Key Enumerations Reference

### `IncomingSource` (who sent the document)
| Value | Name |
|---|---|
| 1 | Studio (Studio+) |
| 2 | HoursPlus |
| 3 | IPCP (internal) |
| 4 | CapsPay |
| 5 | ETC |
| 6 | CNCPayroll |
| 7 | HTG |

### `Destination` (where data is sent after processing)
| Value | Name |
|---|---|
| 1 | FMS |
| 2 | CAPS (CAPSPay) |
| 3 | ETC |
| 4 | CNCPAYROLL |
| 5 | STUDIOPLUS |
| 6 | HTG |

### `FileStatus` (state machine)
| Value | Name |
|---|---|
| 0 | OcrRequired |
| 1 | OcrInProgress |
| 2 | OcrFailed |
| 3 | OcrCompleted |
| 4 | DataEntryRequired |
| 5 | DataEntryInProgress |
| 6 | DataEntryCompleted |
| 7 | ValidationInProgress |
| 8 | ValidationCompleted |
| 9 | Submitted |
| 10 | SubmissionFailed |
| 21 | SortingFailed |
| 22 | SortingCompleted |

### `FormType` (document types)
TimeCard, I9, W4, W9, DirectDeposit, BoxRental, StartPaperwork, DealMemo, EmploymentApplication, Mileage, 401K, VoidedCheck, LOI, TRF1065, ApprovalEmail, StateW4, and 13+ more.

### `FileAssessmentType` (automation level)
- `NoHumanInLoop` — fully automated path
- `MinHumanInLoop` — light review required
- `FullHumanInLoop` — complete manual data entry
- `ReviewOnly` — pre-populated, human reviews for accuracy

---

## Quick Reference: Where to Look for What

| Question | Where to Look |
|---|---|
| Why did a document fail OCR? | `IncomingFileDetails.Exception`, `FileStatus=2` |
| What did Textract extract from a document? | `IncomingFileDetails.OCRInfoPath` (S3), or use Textract Analyzer tool |
| What fields were extracted from a form? | `SortedFileInformation.DtoInformation` (JSON) |
| What was sent to a downstream system? | `OutgoingPayload.PayloadData` |
| Why was a field empty after extraction? | Check `FormPages.ConfigurationSettingsJson` template vs Textract Analyzer — either keyword mismatch or coordinates off |
| What forms does a given template cover? | `FormPages` table, filter by `TemplateId` |
| How is a production client configured? | `Projects` table, `FormPageOverrides` for custom templates |
| LLM extraction status for a document? | `GET /cache/{document_id}` on processing server, or `llm_cache.db` |
| How to add a new form type? | Add a `FormPage` record with `SearchJsonString` (classification keywords) and `ConfigurationSettingsJson` (extraction template) |
