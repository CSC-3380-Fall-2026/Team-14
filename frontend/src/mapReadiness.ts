type SourceData = { sourceId?: string; coord?: unknown }
type MapReadinessStatus = 'ready' | 'error'

/** MapLibre can fire load after every raster tile has failed, including silent 404s. */
export function createMapReadiness(report: (state: MapReadinessStatus) => void) {
  let settled = false
  let hasUsableTile = false
  return {
    sourceData(event: SourceData) {
      // The public sourcedata event has a coord only when a tile loaded successfully.
      // Metadata/content events alone do not prove any map image is available.
      if (event.sourceId !== 'openstreetmap' || !event.coord) return
      hasUsableTile = true
      if (settled) report('ready')
    },
    loaded() {
      settled = true
      report(hasUsableTile ? 'ready' : 'error')
    },
    failed() {
      if (!hasUsableTile) report('error')
    },
  }
}
