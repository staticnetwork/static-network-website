import { useRef, useState } from 'react'
import { listenOnce, speechRecognitionSupported } from '../../lib/ai/sageVoice/sageSpeechRecognition'

export default function SageVoiceButton({ onTranscript, disabled = false }) {
  const recognition = useRef(null)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const supported = speechRecognitionSupported()

  function listen() {
    if (!supported || disabled) return
    if (listening) {
      recognition.current?.stop()
      return
    }
    setError('')
    recognition.current = listenOnce({
      onStart: () => setListening(true),
      onResult: (transcript, final) => onTranscript?.(transcript, final),
      onError: (nextError) => setError(nextError.message),
      onEnd: () => setListening(false),
    })
  }

  return (
    <div className="sage-voice-control">
      <button className={listening ? 'is-listening' : ''} type="button" onClick={listen} disabled={!supported || disabled} aria-label={listening ? 'Stop listening' : 'Push to talk to S.A.G.E.'}>
        <span />
        {listening ? 'LISTENING' : 'VOICE'}
      </button>
      {listening && <small>Microphone active. Audio is not stored.</small>}
      {!supported && <small>Voice input is unavailable in this browser. Type instead.</small>}
      {error && <small>{error}</small>}
    </div>
  )
}

