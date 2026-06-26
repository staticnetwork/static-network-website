export function speechRecognitionSupported() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function listenOnce({ onStart, onResult, onError, onEnd }) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!Recognition) {
    onError?.(new Error('Speech recognition is not supported in this browser.'))
    return null
  }
  const recognition = new Recognition()
  recognition.lang = 'en-GB'
  recognition.interimResults = true
  recognition.continuous = false
  recognition.onstart = () => onStart?.()
  recognition.onresult = (event) => {
    const transcript = [...event.results].map((result) => result[0].transcript).join(' ')
    onResult?.(transcript, event.results[event.results.length - 1].isFinal)
  }
  recognition.onerror = (event) => onError?.(new Error(event.error || 'Voice recognition failed.'))
  recognition.onend = () => onEnd?.()
  recognition.start()
  return recognition
}

