import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/** Shows what went wrong instead of a blank screen, with a way to recover. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Speak Up English crashed:', error, info.componentStack)
  }

  resetData = () => {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith('speakup.'))
        .forEach((k) => window.localStorage.removeItem(k))
    } catch {
      /* storage unavailable */
    }
    window.location.hash = '#/'
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div role="alert" style={{ maxWidth: 640, margin: '48px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif', color: '#f4f2ee' }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Speak Up English couldn't load this page</h1>
        <p style={{ color: '#a8a49c' }}>Please send this message to the developer:</p>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#1d1d22', padding: 12, borderRadius: 8, fontSize: 13 }}>
          {error.name}: {error.message}
          {'\n\n'}Browser: {navigator.userAgent}
        </pre>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => window.location.reload()} style={btn}>Reload</button>
          <button type="button" onClick={this.resetData} style={btn}>Clear saved progress and reload</button>
        </div>
      </div>
    )
  }
}

const btn = { padding: '8px 16px', borderRadius: 999, border: '1px solid #d4af37', background: 'transparent', color: '#d4af37', cursor: 'pointer' }
