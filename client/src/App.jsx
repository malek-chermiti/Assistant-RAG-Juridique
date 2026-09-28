import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)

  const endOfMessagesRef = useRef(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setInput('')
    setMessages((previous) => [...previous, { role: 'user', text: trimmed }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'Chat request failed')
      }

      setMessages((previous) => [...previous, { role: 'ai', text: data.answer }])
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        { role: 'ai', text: error?.message ?? 'Chat request failed' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data?.error || 'Upload failed')
      }

      setUploadStatus('Document importé et indexé.')
      setSelectedFile(null)
    } catch (error) {
      setUploadStatus(error?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="appHeaderInner">
          <div className="appMark" aria-hidden="true">J</div>
          <div>
            <div className="appTitle">Assistant juridique</div>
            <div className="appSubtitle">Votre base documentaire, en conversation.</div>
          </div>
        </div>
      </header>

      <main className="appMain">
        <section className="uploadPanel" aria-label="Importer un document">
          <div className="uploadIntro">
            <span className="sectionEyebrow">Bibliothèque</span>
            <span className="uploadDescription">Ajoutez un document PDF à votre base.</span>
          </div>
          <div className="uploadRow">
            <label className="uploadButton" htmlFor="pdf-upload">
              Choisir un PDF
            </label>
            <input
              id="pdf-upload"
              className="uploadInput"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
            <div className="uploadMeta" title={selectedFile?.name}>
              {selectedFile ? selectedFile.name : 'Aucun fichier sélectionné'}
            </div>
            <button
              className="primaryButton"
              type="button"
              onClick={uploadDocument}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Import en cours…' : 'Importer'}
            </button>
          </div>
          {uploadStatus && <div className="uploadStatus" role="status">{uploadStatus}</div>}
        </section>

        <section className="chatPanel" aria-label="Conversation avec l’assistant">
          <div className="conversationHeader">
            <div>
              <span className="sectionEyebrow">Espace de travail</span>
              <h1>Conversation</h1>
            </div>
            <span className="conversationStatus"><span />Assistant prêt</span>
          </div>

          <div className="messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.length === 0 && (
              <div className="emptyState">
                <span className="emptyMark" aria-hidden="true">§</span>
                <h2>Que souhaitez-vous éclaircir ?</h2>
                <p>Importez un PDF, puis posez une question sur son contenu.</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`messageRow ${message.role === 'user' ? 'isUser' : 'isAi'}`}
              >
                {message.role === 'ai' && <span className="messageAvatar" aria-hidden="true">J</span>}
                <div className="messageBubble">
                  {message.role === 'ai' ? <ReactMarkdown>{message.text}</ReactMarkdown> : message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="messageRow isAi">
                <span className="messageAvatar" aria-hidden="true">J</span>
                <div className="messageBubble isTyping" aria-label="Réponse en cours">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="composer">
            <div className="composerInner">
              <textarea
                className="composerInput"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder="Écrivez votre question…"
                aria-label="Votre question"
                rows={1}
              />
              <button
                className="sendButton"
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                aria-label="Envoyer le message"
              >
                <span>Envoyer</span>
                <span aria-hidden="true">↑</span>
              </button>
            </div>
            <div className="composerHint">Entrée pour envoyer <span>·</span> Maj + Entrée pour un retour à la ligne</div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
