export function captureCanvas(canvas, fileName = 'static-entity-capture.png') {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ? new File([blob], fileName, { type: 'image/png' }) : null), 'image/png')
  })
}

