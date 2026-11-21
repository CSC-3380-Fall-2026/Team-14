import assert from 'node:assert/strict'
import test from 'node:test'
import { searchDestinations } from '../src/destinationSearch.ts'

const feature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [-90.07012, 29.97599] },
  properties: { osm_type: 'R', osm_id: 123, name: 'New Orleans', state: 'Louisiana', country: 'United States' },
}

test('search works without a key and sends an encoded Photon query only', async (t) => {
  let requested: URL | undefined
  let requestSignal: AbortSignal | null | undefined
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    requested = new URL(String(input))
    requestSignal = init?.signal
    return Response.json({ type: 'FeatureCollection', features: [feature] })
  })
  const controller = new AbortController()
  const results = await searchDestinations('  New Orleans & river  ', controller.signal)
  assert.deepEqual(results, [{ id: 'R123', label: 'New Orleans, Louisiana, United States', destination: { longitude: -90.07012, latitude: 29.97599 } }])
  assert.equal(requested?.origin, 'https://photon.komoot.io')
  assert.equal(requested?.pathname, '/api/')
  assert.equal(requested?.searchParams.get('q'), 'New Orleans & river')
  assert.equal(requested?.searchParams.get('limit'), '5')
  assert.equal(requested?.searchParams.has('access_token'), false)
  assert.equal(requestSignal, controller.signal)
})

test('search supports another Photon service and preserves address context without duplicates', async (t) => {
  let requested = ''
  t.mock.method(globalThis, 'fetch', async (input: unknown) => {
    requested = String(input)
    return Response.json({ features: [{ ...feature, geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { name: 'Museum', street: 'Main Street', housenumber: '5', city: 'Paris', state: 'Paris', country: 'France' } }] })
  })
  assert.deepEqual((await searchDestinations('Museum', undefined, 'https://search.example/api'))[0], {
    id: '0', label: 'Museum, 5 Main Street, Paris, France', destination: { latitude: 0, longitude: 0 },
  })
  assert.equal(new URL(requested).origin, 'https://search.example')
})

test('search ignores malformed results instead of selecting invalid coordinates', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ features: [
    null, {}, { ...feature, geometry: { type: 'LineString', coordinates: [10, 20] } },
    { ...feature, geometry: { type: 'Point', coordinates: [181, 0] } },
    { ...feature, geometry: { type: 'Point', coordinates: [0, 91] } },
    { ...feature, geometry: { type: 'Point', coordinates: ['10', 20] } },
    { ...feature, properties: {} }, feature,
  ] }))
  assert.equal((await searchDestinations('New Orleans', undefined, 'https://search.example/invalid')).length, 1)
})

test('a successful empty result list remains a normal no-match result', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ features: [] }))
  assert.deepEqual(await searchDestinations('No such place', undefined, 'https://search.example/empty'), [])
})

test('invalid and non-JSON responses produce readable failures', async (t) => {
  for (const [index, response] of [Response.json({ unexpected: true }), new Response('<html>Unavailable</html>')].entries()) {
    const mock = t.mock.method(globalThis, 'fetch', async () => response)
    await assert.rejects(searchDestinations('New Orleans', undefined, `https://search.example/response-${index}`), /could not read/i)
    mock.mock.restore()
  }
})

test('blank, too long, and too many word queries are rejected before a request', async (t) => {
  let requests = 0
  t.mock.method(globalThis, 'fetch', async () => { requests++; return Response.json({ features: [] }) })
  for (const query of ['', ' ', 'a', 'x'.repeat(201), Array(21).fill('city').join(' ')]) {
    await assert.rejects(searchDestinations(query), /enter|shorter/i)
  }
  assert.equal(requests, 0)
})

test('provider and rate-limit failures give actionable messages', async (t) => {
  for (const [status, message] of [[403, /unavailable/i], [400, /shorter/i], [429, /wait/i], [500, /try again/i]] as const) {
    const mock = t.mock.method(globalThis, 'fetch', async () => Response.json({ message: 'provider detail' }, { status }))
    await assert.rejects(searchDestinations('New Orleans', undefined, `https://search.example/status-${status}`), message)
    mock.mock.restore()
  }
})

test('repeated searches use a copy of cached results without another provider request', async (t) => {
  let requests = 0
  t.mock.method(globalThis, 'fetch', async () => { requests++; return Response.json({ features: [feature] }) })
  const endpoint = 'https://search.example/cache'
  const first = await searchDestinations('New Orleans', undefined, endpoint)
  first[0].destination.latitude = 0
  const second = await searchDestinations(' new orleans ', undefined, endpoint)
  assert.equal(second[0].destination.latitude, 29.97599)
  assert.equal(requests, 1)
})

test('rapid uncached searches are limited while later searches can proceed', async (t) => {
  let now = 1000
  t.mock.method(Date, 'now', () => now)
  let requests = 0
  t.mock.method(globalThis, 'fetch', async () => { requests++; return Response.json({ features: [] }) })
  const endpoint = 'https://search.example/pace'
  await searchDestinations('Paris', undefined, endpoint)
  await assert.rejects(searchDestinations('London', undefined, endpoint), /wait/i)
  assert.equal(requests, 1)
  now = 2000
  await searchDestinations('London', undefined, endpoint)
  assert.equal(requests, 2)
})

test('expired cached searches refresh from the provider', async (t) => {
  let now = 0
  t.mock.method(Date, 'now', () => now)
  let requests = 0
  t.mock.method(globalThis, 'fetch', async () => { requests++; return Response.json({ features: [] }) })
  const endpoint = 'https://search.example/expire'
  await searchDestinations('Paris', undefined, endpoint)
  now = 11 * 60 * 1000
  await searchDestinations('Paris', undefined, endpoint)
  assert.equal(requests, 2)
})

test('request cancellation prevents even a cached or obsolete request from returning', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_input: unknown, init?: RequestInit) => {
    init?.signal?.throwIfAborted()
    return Response.json({ features: [] })
  })
  const endpoint = 'https://search.example/cancel'
  await searchDestinations('Paris', undefined, endpoint)
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(searchDestinations('Paris', controller.signal, endpoint), { name: 'AbortError' })
})
