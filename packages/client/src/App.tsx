import { useEffect, useState } from 'react'
import type { ApiResponse, HealthResponse } from '@scribe-timecards/shared'

function App() {
  const [status, setStatus] = useState<string>('loading...')

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json() as Promise<ApiResponse<HealthResponse>>)
      .then((body) => setStatus(body.data.status))
      .catch(() => setStatus('unreachable'))
  }, [])

  return (
    <main>
      <h1>Scribe Timecards</h1>
      <p>Server: {status}</p>
    </main>
  )
}

export default App
