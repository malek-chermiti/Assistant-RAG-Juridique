import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [apiStatus, setApiStatus] = useState('Vérification...')

  useEffect(() => {
    fetch('/api/health')
      .then((response) => {
        if (!response.ok) throw new Error('API indisponible')
        return response.json()
      })
      .then((data) => setApiStatus(data.status === 'ok' ? 'Connectée' : 'Inconnue'))
      .catch(() => setApiStatus('Indisponible'))
  }, [])

  return (
    <main className="app-shell">
      <p className="eyebrow">Assistant RAG juridique</p>
      <h1>Client et serveur sont prêts.</h1>
      <p className="intro">
        Le front React communique avec l&apos;API Express via le proxy Vite.
      </p>
      <section className="status-panel" aria-live="polite">
        <span className={`status-dot ${apiStatus === 'Connectée' ? 'online' : ''}`} />
        <div>
          <strong>API Express</strong>
          <p>{apiStatus}</p>
        </div>
      </section>
    </main>
  )
}

export default App
