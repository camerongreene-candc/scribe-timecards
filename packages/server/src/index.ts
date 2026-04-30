import express from 'express'
import type { HealthResponse, ApiResponse, ProcessApiResponse, ExtractionResult } from '@scribe-timecards/shared'
import { getValidationFlaggedFields } from '@scribe-timecards/shared'
import { mockClaudeExtract } from './mock-extraction.js'
import { mapTimecardToDay, mapTimecardToFlaggedFields } from './mapper.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.get('/api/health', (_req, res) => {
  const body: ApiResponse<HealthResponse> = { data: { status: 'ok' } }
  res.json(body)
})

app.get('/api/extract', async (_req, res) => {
  try {
    const extraction = await mockClaudeExtract()
    const body: ApiResponse<ExtractionResult> = { data: extraction }
    res.json(body)
  } catch (err) {
    console.error('[/api/extract]', err)
    res.status(500).json({ error: String(err) })
  }
})

app.post('/api/process', async (_req, res) => {
  try {
    const extraction = await mockClaudeExtract()

    const results = extraction.timecards.map((t) => ({
      employeeName: t.employee.fullName.value,
      day: mapTimecardToDay(t),
    }))

    const confidence = extraction.timecards.map((t) => ({
      employeeName: t.employee.fullName.value,
      flaggedFields: mapTimecardToFlaggedFields(t),
    }))

  const validation = extraction.timecards.map((t) => ({
    employeeName: t.employee.fullName.value,
    flaggedFields: getValidationFlaggedFields(mapTimecardToDay(t)),
  }))

    const body: ApiResponse<ProcessApiResponse> = { data: { results, confidence, validation } }
    res.json(body)
  } catch (err) {
    console.error('[/api/process]', err)
    res.status(500).json({ error: String(err) })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
