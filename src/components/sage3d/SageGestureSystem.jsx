export const sageGestures = ['arrival', 'idle', 'point', 'talk']
export function normalizeSageGesture(value) {
  return sageGestures.includes(value) ? value : 'idle'
}

