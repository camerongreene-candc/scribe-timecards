import express from 'express'
import type { HealthResponse, ApiResponse } from '@scribe-timecards/shared'
import type { DTSDay } from '@scribe-timecards/shared'
import { mockClaudeExtract } from './mock-extraction.js'
import { mapExtractionToDTSDay } from './mapper.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.get('/api/health', (_req, res) => {
  const body: ApiResponse<HealthResponse> = { data: { status: 'ok' } }
  res.json(body)
})

app.post('/api/process', async (_req, res) => {
  const extracted = await mockClaudeExtract()
  const day = mapExtractionToDTSDay(extracted)
  const body: ApiResponse<{ employeeName: string; day: Partial<DTSDay> }> = {
    data: { employeeName: extracted.employee.fullName, day },
  }
  res.json(body)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
