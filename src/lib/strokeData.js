const STROKE_DATA_URL = `${import.meta.env.BASE_URL}stroke-data/kanjivg-kana-paths.json`

let datasetPromise

function loadDataset() {
  if (!datasetPromise) {
    const request = fetch(STROKE_DATA_URL).then((response) => {
      if (!response.ok) throw new Error('stroke data unavailable')
      return response.json()
    })
    const retryableRequest = request.catch((error) => {
      if (datasetPromise === retryableRequest) datasetPromise = undefined
      throw error
    })
    datasetPromise = retryableRequest
  }
  return datasetPromise
}

export async function loadStrokePaths(character) {
  try {
    const dataset = await loadDataset()
    const paths = dataset?.characters?.[character]
    if (!Array.isArray(paths) || !paths.length || paths.some((path) => typeof path !== 'string' || !path)) {
      return null
    }
    return paths
  } catch {
    return null
  }
}
