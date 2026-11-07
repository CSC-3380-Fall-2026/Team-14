import assert from 'node:assert/strict'
import test from 'node:test'
import { searchDestinations } from '../src/destinationSearch.ts'

const feature = {
  type: 'Feature', id: 'dXJuOm1ieHBsYzpmb28',
  geometry: { type: 'Point', coordinates: [-90.07012, 29.97599] },
  properties: { name: 'New Orleans', place_formatted: 'Louisiana, United States', full_address: 'New Orleans, Louisiana, United States' },
}

test('search returns labeled longitude/latitude results and emits an encoded permanent query', async (t) => {
  let requested: URL | undefined
  let requestSignal: AbortSignal | null | undefined
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    requested = new URL(String(input))
    requestSignal = init?.signal
    return Response.json({ type: 'FeatureCollection', features: [feature] })
  })
  const controller = new AbortController()
  const results = await searchDestinations('  New Orleans & river  ', 'pk.example', controller.signal)
  assert.deepEqual(results, [{ id: 'dXJuOm1ieHBsYzpmb28', label: 'New Orleans, Louisiana, United States', destination: { longitude: -90.07012, latitude: 29.97599 } }])
  assert.equal(requested?.origin, 'https://api.mapbox.com')
  assert.equal(requested?.pathname, '/search/geocode/v6/forward')
  assert.equal(requested?.searchParams.get('q'), 'New Orleans & river')
  assert.equal(requested?.searchParams.get('access_token'), 'pk.example')
  assert.equal(requested?.searchParams.get('autocomplete'), 'false')
  assert.equal(requested?.searchParams.get('permanent'), 'true')
  assert.equal(requestSignal, controller.signal)
})

test('search accepts a zero coordinate and falls back to name plus place context', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ features: [{
    ...feature, geometry: { type: 'Point', coordinates: [0, 0] },
    properties: { name: 'Origin', place_formatted: 'Example region' },
  }] }))
  assert.deepEqual((await searchDestinations('Origin', 'pk.example'))[0], {
    id: feature.id, label: 'Origin, Example region', destination: { latitude: 0, longitude: 0 },
  })
})

test('search ignores malformed results instead of selecting invalid coordinates', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ features: [
    null, {}, { ...feature, geometry: { type: 'LineString', coordinates: [10, 20] } },
    { ...feature, geometry: { type: 'Point', coordinates: [181, 0] } },
    { ...feature, geometry: { type: 'Point', coordinates: [0, 91] } },
    { ...feature, geometry: { type: 'Point', coordinates: ['10', 20] } },
    { ...feature, properties: {} }, feature,
  ] }))
  assert.equal((await searchDestinations('New Orleans', 'pk.example')).length, 1)
})

test('a successful empty result list remains a normal no-match result', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ features: [] }))
  assert.deepEqual(await searchDestinations('No such place', 'pk.example'), [])
})

test('an invalid response is reported as an error rather than a successful empty search', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ unexpected: true }))
  await assert.rejects(searchDestinations('New Orleans', 'pk.example'), /could not read/i)
})

test('a non-JSON provider response produces a readable failure message', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Unavailable</html>'))
  await assert.rejects(searchDestinations('New Orleans', 'pk.example'), /could not read/i)
})

test('blank, too long, and too many word queries are rejected before a request', async (t) => {
  let requests = 0
  t.mock.method(globalThis, 'fetch', async () => { requests++; return Response.json({ features: [] }) })
  for (const query of ['', ' ', 'a', 'x'.repeat(201), Array(21).fill('city').join(' ')]) {
    await assert.rejects(searchDestinations(query, 'pk.example'), /enter|shorter/i)
  }
  assert.equal(requests, 0)
})

test('account and rate-limit failures give actionable messages', async (t) => {
  for (const [status, message] of [[401, /token|account/i], [403, /token|account/i], [422, /shorter/i], [429, /wait/i], [500, /try again/i]] as const) {
    const mock = t.mock.method(globalThis, 'fetch', async () => Response.json({ message: 'provider detail' }, { status }))
    await assert.rejects(searchDestinations('New Orleans', 'pk.example'), message)
    mock.mock.restore()
  }
})

test('request cancellation propagates so the UI can ignore obsolete results', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_input: unknown, init?: RequestInit) => {
    init?.signal?.throwIfAborted()
    return Response.json({ features: [] })
  })
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(searchDestinations('New Orleans', 'pk.example', controller.signal), { name: 'AbortError' })
})
