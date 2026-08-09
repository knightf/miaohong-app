export function normalizePoint(point, rect) {
  return {
    x: Math.round(((point.x - rect.left) / rect.width) * 100),
    y: Math.round(((point.y - rect.top) / rect.height) * 100),
  }
}

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

function asPoint(point) {
  return Array.isArray(point) ? { x: point[0], y: point[1] } : point
}

export function traceMatchesStroke(actual, expected, tolerance = 18) {
  if (actual.length < 2 || expected.length < 2) return false
  const target = expected.map(asPoint)
  const startDistance = distance(actual[0], target[0])
  const endDistance = distance(actual.at(-1), target.at(-1))
  if (startDistance > tolerance || endDistance > tolerance * 1.25) return false

  const sample = actual.filter((_, index) => index % Math.max(1, Math.floor(actual.length / 12)) === 0)
  const averageNearestDistance = sample.reduce((sum, point) => {
    const nearest = Math.min(...target.map((candidate) => distance(point, candidate)))
    return sum + nearest
  }, 0) / sample.length

  return averageNearestDistance <= tolerance
}

export function sampleSvgPath(path, sampleCount = 36) {
  const length = path.getTotalLength()
  return Array.from({ length: sampleCount }, (_, index) => {
    const point = path.getPointAtLength((length * index) / (sampleCount - 1))
    return { x: (point.x / 109) * 100, y: (point.y / 109) * 100 }
  })
}
