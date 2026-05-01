import express from 'express'
import type { HealthResponse, ApiResponse, ProcessApiResponse, RosterResult } from '@scribe-timecards/shared'
import { getValidationFlaggedFields } from '@scribe-timecards/shared'
import { mockClaudeExtract, mockRoster } from './mock-extraction.js'
import { mapTimecardToDay, mapTimecardToFlaggedFields } from './mapper.js'
import { buildCsv } from './csvHelper.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.get('/api/health', (_req, res) => {
  const body: ApiResponse<HealthResponse> = { data: { status: 'ok' } }
  res.json(body)
})

app.get('/api/extract', (req, res) => {
  const project = String(req.query.project ?? 'static-bloom')
  const body: ApiResponse<RosterResult> = { data: mockRoster(project) }
  res.json(body)
})

app.post('/api/process', async (req, res) => {
  try {
    const project = String(req.query.project ?? 'static-bloom')
    const extraction = await mockClaudeExtract(project)

    const results = extraction.timecards.map((t) => ({
      employeeName: t.employee.fullName.value,
      day: mapTimecardToDay(t),
      ndb: t.ndb?.value ?? null,
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

app.post('/api/export', (req, res) => {
  const rows = req.body?.rows ?? []
  const csv = buildCsv(rows)
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="timecards.csv"')
  res.send(csv)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
