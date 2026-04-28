import express from 'express'
import type { HealthResponse, ApiResponse, ExtractedTimecardData, Timecard } from '@scribe-timecards/shared'
import { mockClaudeExtract } from './mock-extraction.js'
import { mapExtractionToTimecard } from './mapper.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.get('/api/health', (_req, res) => {
  const body: ApiResponse<HealthResponse> = { data: { status: 'ok' } }
  res.json(body)
})

// Step 1 — Claude OCR reads the production report PDF and returns structured output
app.post('/api/extract', async (_req, res) => {
  const extracted = await mockClaudeExtract()
  const body: ApiResponse<ExtractedTimecardData> = { data: extracted }
  res.json(body)
})

// Step 2 — Map Claude's structured output into a SaveTimecardRequest for hours+
app.post('/api/process', async (_req, res) => {
  const extracted = await mockClaudeExtract()
  const timecard = mapExtractionToTimecard(extracted)
  const body: ApiResponse<{ extracted: ExtractedTimecardData; timecard: Timecard }> = {
    data: { extracted, timecard },
  }
  res.json(body)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
