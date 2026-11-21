import type { Destination } from './tripDraft.ts'

export type DestinationSearchResult = {
  id: string
  label: string
  destination: Destination
}

const DEFAULT_ENDPOINT = 'https://photon.komoot.io/api/'
const CACHE_DURATION_MS = 10 * 60 * 1000
const MAX_CACHED_SEARCHES = 50
const REQUEST_INTERVAL_MS = 1000
const cache = new Map<string, { expires: number; results: DestinationSearchResult[] }>()
const lastRequestAt = new Map<string, number>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export async function searchDestinations(
  query: string,
  signal?: AbortSignal,
  endpoint: string = DEFAULT_ENDPOINT,
): Promise<DestinationSearchResult[]> {
  signal?.throwIfAborted()
  const trimmed = query.trim()
  if (trimmed.length < 2 || trimmed.length > 200 || trimmed.split(/\s+/).length > 20) {
    throw new Error('Enter a shorter city, region, or address with 2–200 characters and no more than 20 words.')
  }
  const cacheKey = `${endpoint}\n${trimmed.toLocaleLowerCase()}`
  const now = Date.now()
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > now) return structuredClone(cached.results)
  if (now - (lastRequestAt.get(endpoint) ?? -Infinity) < REQUEST_INTERVAL_MS) {
    throw new Error('Please wait a moment before another search.')
  }
  const url = new URL(endpoint)
  url.searchParams.set('q', trimmed)
  url.searchParams.set('limit', '5')
  lastRequestAt.set(endpoint, now)
  const response = await fetch(url.toString(), { signal })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Search is unavailable right now. You can still choose a spot on the map.')
    }
    if (response.status === 400 || response.status === 422) throw new Error('Try a shorter city, region, or address.')
    if (response.status === 429) throw new Error('Search is busy. Wait a moment, then try again.')
    throw new Error('Search could not finish. Please try again.')
  }
  let data: unknown
  try {
    data = await response.json()
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('We could not read the search results. Please try again.')
  }
  signal?.throwIfAborted()
  if (!isRecord(data) || !Array.isArray(data.features)) {
    throw new Error('We could not read the search results. Please try again.')
  }
  const results = data.features.flatMap((feature: unknown, index: number): DestinationSearchResult[] => {
    if (!isRecord(feature) || !isRecord(feature.geometry) || !isRecord(feature.properties)) return []
    const { geometry, properties } = feature
    if (geometry.type !== 'Point' || !Array.isArray(geometry.coordinates)) return []
    const [longitude, latitude] = geometry.coordinates
    if (typeof longitude !== 'number' || typeof latitude !== 'number'
      || !Number.isFinite(longitude) || !Number.isFinite(latitude)
      || Math.abs(longitude) > 180 || Math.abs(latitude) > 90) return []
    const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''
    const street = [text(properties.housenumber), text(properties.street)].filter(Boolean).join(' ')
    const parts = [properties.name, street, properties.city, properties.district, properties.state, properties.country]
      .map(text).filter(Boolean)
    const label = [...new Set(parts)].join(', ')
    if (!label) return []
    const id = typeof properties.osm_type === 'string' && typeof properties.osm_id === 'number'
      ? `${properties.osm_type}${properties.osm_id}` : String(index)
    return [{ id, label, destination: { latitude, longitude } }]
  }).slice(0, 5)
  cache.delete(cacheKey)
  cache.set(cacheKey, { expires: Date.now() + CACHE_DURATION_MS, results: structuredClone(results) })
  if (cache.size > MAX_CACHED_SEARCHES) cache.delete(cache.keys().next().value!)
  return results
}
