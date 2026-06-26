import { useState } from 'react'
import SageVoiceButton from './SageVoiceButton'

export default function SageCommandBar({ onCommand }) {
  const [value, setValue] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!value.trim()) return
    onCommand(value)
    setValue('')
  }

  function transcript(text, final) {
    setValue(text)
    if (final && text.trim()) {
      onCommand(text)
      setValue('')
    }
  }

  return (
    <form className="sage-command-bar" onSubmit={submit}>
      <label><span className="sr-only">Ask S.A.G.E.</span><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ask S.A.G.E. to open, explain, build, or prepare..." /></label>
      <button type="submit">SEND</button>
      <SageVoiceButton onTranscript={transcript} />
    </form>
  )
}

