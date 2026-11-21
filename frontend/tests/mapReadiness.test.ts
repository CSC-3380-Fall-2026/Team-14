import assert from 'node:assert/strict'
import test from 'node:test'
import { createMapReadiness } from '../src/mapReadiness.ts'

test('settled 404 tiles cannot make a blank map ready', () => {
  const states: string[] = []
  const readiness = createMapReadiness(state => states.push(state))
  readiness.sourceData({ sourceId: 'openstreetmap' }) // Source metadata, not an image.
  readiness.loaded() // MapLibre fires load even if every image returned 404.
  assert.deepEqual(states, ['error'])
})

test('settled failed tiles stay unavailable after the public error event', () => {
  const states: string[] = []
  const readiness = createMapReadiness(state => states.push(state))
  readiness.failed()
  readiness.loaded()
  assert.ok(states.length > 0)
  assert.ok(states.every(state => state === 'error'))
})

test('a partial tile failure does not permanently hide a usable map', () => {
  const states: string[] = []
  const readiness = createMapReadiness(state => states.push(state))
  readiness.failed()
  readiness.sourceData({ sourceId: 'openstreetmap', coord: {} })
  readiness.loaded()
  assert.equal(states.at(-1), 'ready')
  readiness.failed()
  assert.equal(states.at(-1), 'ready')
})

test('a genuinely successful tile can recover after load reported unavailable', () => {
  const states: string[] = []
  const readiness = createMapReadiness(state => states.push(state))
  readiness.loaded()
  assert.equal(states.at(-1), 'error')
  readiness.sourceData({ sourceId: 'openstreetmap', coord: {} })
  assert.equal(states.at(-1), 'ready')
})

test('metadata and another source cannot prove the raster map is usable', () => {
  const states: string[] = []
  const readiness = createMapReadiness(state => states.push(state))
  readiness.sourceData({ sourceId: 'other-source', coord: {} })
  readiness.sourceData({ sourceId: 'openstreetmap' })
  readiness.loaded()
  assert.equal(states.at(-1), 'error')
})
