import type { Destination } from './tripDraft.ts'

export type DestinationSearchResult = {
  id: string
  label: string
  destination: Destination
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export async function searchDestinations(
  query: string,
  token: string,
  signal?: AbortSignal,
): Promise<DestinationSearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2 || trimmed.length > 200 || trimmed.split(/\s+/).length > 20) {
    throw new Error('Enter a shorter city, region, or address with 2–200 characters and no more than 20 words.')
  }
  const params = new URLSearchParams({
    q: trimmed, access_token: token, autocomplete: 'false', limit: '5',
    // Saved example trips can retain these coordinates after the visit.
    permanent: 'true',
  })
  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, { signal })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Search is unavailable for this Mapbox token or account. You can still choose a spot on the map.')
    }
    if (response.status === 422) throw new Error('Try a shorter city, region, or address.')
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
  if (!isRecord(data) || !Array.isArray(data.features)) {
    throw new Error('We could not read the search results. Please try again.')
  }
  return data.features.flatMap((feature: unknown, index: number): DestinationSearchResult[] => {
    if (!isRecord(feature) || !isRecord(feature.geometry) || !isRecord(feature.properties)) return []
    const { geometry, properties } = feature
    if (geometry.type !== 'Point' || !Array.isArray(geometry.coordinates)) return []
    const [longitude, latitude] = geometry.coordinates
    if (typeof longitude !== 'number' || typeof latitude !== 'number'
      || !Number.isFinite(longitude) || !Number.isFinite(latitude)
      || Math.abs(longitude) > 180 || Math.abs(latitude) > 90) return []
    const label = typeof properties.full_address === 'string' && properties.full_address.trim()
      ? properties.full_address.trim()
      : [properties.name, properties.place_formatted]
        .filter((part): part is string => typeof part === 'string' && !!part.trim())
        .map(part => part.trim()).join(', ')
    if (!label) return []
    return [{ id: typeof feature.id === 'string' ? feature.id : String(index), label, destination: { latitude, longitude } }]
  }).slice(0, 5)
}
