import { useState } from 'react'
import type { ApiResponse, ExtractedTimecardData, Timecard } from '@scribe-timecards/shared'

interface ProcessResult {
  extracted: ExtractedTimecardData
  timecard: Timecard
}

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; data: ProcessResult }
  | { status: 'error'; message: string }

function App() {
  const [state, setState] = useState<State>({ status: 'idle' })

  async function handleProcess() {
    setState({ status: 'loading' })
    try {
      const res = await fetch('/api/process', { method: 'POST' })
      const body: ApiResponse<ProcessResult> = await res.json()
      if (body.error) throw new Error(body.error)
      setState({ status: 'done', data: body.data })
    } catch (err) {
      setState({ status: 'error', message: String(err) })
    }
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: 32 }}>
      <h2>Scribe Timecards — POC</h2>

      <button onClick={handleProcess} disabled={state.status === 'loading'}>
        {state.status === 'loading' ? 'Extracting…' : 'Process Production Report'}
      </button>

      {state.status === 'error' && <p style={{ color: 'red' }}>{state.message}</p>}

      {state.status === 'done' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 24 }}>
          <section>
            <b>Claude extraction [{state.data.extracted.confidence} confidence]</b>
            <pre style={pre}>{JSON.stringify(state.data.extracted, null, 2)}</pre>
          </section>
          <section>
            <b>Mapped → hours+ SaveTimecardRequest</b>
            <pre style={pre}>{JSON.stringify(state.data.timecard, null, 2)}</pre>
          </section>
        </div>
      )}
    </main>
  )
}

const pre: React.CSSProperties = {
  background: '#f5f5f5',
  padding: 12,
  fontSize: 11,
  overflow: 'auto',
  maxHeight: '80vh',
  marginTop: 4,
}

export default App
