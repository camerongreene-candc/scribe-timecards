import express from 'express'
import type { HealthResponse, ApiResponse, ProcessApiResponse } from '@scribe-timecards/shared'
import { mockClaudeExtract } from './mock-extraction.js'
import { mapTimecardToDay, mapTimecardToFlaggedFields } from './mapper.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.get('/api/health', (_req, res) => {
  const body: ApiResponse<HealthResponse> = { data: { status: 'ok' } }
  res.json(body)
})

app.post('/api/process', async (_req, res) => {
  const extraction = await mockClaudeExtract()

  const results = extraction.timecards.map((t) => ({
    employeeName: t.employee.fullName.value,
    day: mapTimecardToDay(t),
  }))

  const confidence = extraction.timecards.map((t) => ({
    employeeName: t.employee.fullName.value,
    flaggedFields: mapTimecardToFlaggedFields(t),
  }))

  const body: ApiResponse<ProcessApiResponse> = { data: { results, confidence } }
  res.json(body)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
