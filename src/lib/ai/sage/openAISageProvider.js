export async function askOpenAISage(input, confirmPaid = false) {
  const response = await fetch('/.netlify/functions/sage-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, confirmPaid }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'S.A.G.E. provider request failed.')
  return data.text
}

