function preferredVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || []
  return voices.find((voice) => /^en-GB/i.test(voice.lang) && /female|serena|susan|kate|samantha|victoria|moira/i.test(voice.name))
    || voices.find((voice) => /^en-GB/i.test(voice.lang))
    || voices.find((voice) => /^en/i.test(voice.lang))
}

export function speakWithBrowser(text, options = {}) {
  if (!('speechSynthesis' in window)) return Promise.resolve(false)
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB'
  utterance.rate = 0.96
  utterance.pitch = 1.02
  utterance.voice = preferredVoice() || null
  return new Promise((resolve) => {
    utterance.onend = () => resolve(true)
    utterance.onerror = () => resolve(false)
    options.onStart?.()
    window.speechSynthesis.speak(utterance)
  })
}

export function stopBrowserSpeech() {
  window.speechSynthesis?.cancel()
}
