import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createTripDraft,
  isTripDraftValid,
  normalizeDestination,
  tripDraftReducer,
} from '../src/tripDraft.ts'

test('wraps map coordinates from a repeated world into longitude bounds', () => {
  assert.deepEqual(normalizeDestination({ latitude: 40, longitude: 285.5 }), {
    latitude: 40, longitude: -74.5,
  })
  assert.deepEqual(normalizeDestination({ latitude: -20, longitude: -434.5 }), {
    latitude: -20, longitude: -74.5,
  })
})

test('rejects impossible or nonfinite map coordinates', () => {
  for (const destination of [
    { latitude: 91, longitude: 0 },
    { latitude: -91, longitude: 0 },
    { latitude: NaN, longitude: 0 },
    { latitude: 0, longitude: Infinity },
  ]) assert.equal(normalizeDestination(destination), null)
})

test('accepts zero coordinates as a real destination', () => {
  assert.deepEqual(normalizeDestination({ latitude: 0, longitude: 0 }), {
    latitude: 0, longitude: 0,
  })
})

test('selecting a destination preserves existing trip preferences', () => {
  const before = {
    ...createTripDraft(),
    startDate: '2026-11-20', endDate: '2026-11-22', budget: '300',
    travelers: '2', interests: ['Food'], notes: 'Vegetarian food',
  }
  const after = tripDraftReducer(before, {
    type: 'destinationSelected', destination: { latitude: 30.45, longitude: -91.19 },
  })
  assert.deepEqual(after, {
    ...before, destination: { latitude: 30.45, longitude: -91.19 },
  })
  assert.equal(before.destination, null)
})

test('editing preferences keeps the selected destination and other fields', () => {
  const before = {
    ...createTripDraft(), destination: { latitude: 30.45, longitude: -91.19 },
    startDate: '2026-11-20', budget: '300', notes: 'Vegetarian food',
  }
  const after = tripDraftReducer(before, {
    type: 'preferencesChanged', changes: { budget: '400', travelers: '2' },
  })
  assert.deepEqual(after, { ...before, budget: '400', travelers: '2' })
  assert.equal(before.budget, '300')
})

test('clearing the destination preserves the rest of the trip draft', () => {
  const before = {
    ...createTripDraft(), destination: { latitude: 30.45, longitude: -91.19 },
    budget: '300', notes: 'Vegetarian food',
  }
  assert.deepEqual(tripDraftReducer(before, {
    type: 'destinationSelected', destination: null,
  }), { ...before, destination: null })
})

test('an invalid map selection cannot replace a valid destination', () => {
  const before = {
    ...createTripDraft(), destination: { latitude: 30.45, longitude: -91.19 },
  }
  assert.deepEqual(tripDraftReducer(before, {
    type: 'destinationSelected', destination: { latitude: 100, longitude: 0 },
  }), before)
})

test('the complete trip needs a destination, ordered dates, and valid amounts', () => {
  const valid = {
    ...createTripDraft(), destination: { latitude: 0, longitude: 0 },
    startDate: '2026-11-20', endDate: '2026-11-22', budget: '300', travelers: '2',
  }
  assert.equal(isTripDraftValid(valid), true)
  for (const changes of [
    { destination: null }, { startDate: '' }, { endDate: '2026-11-19' },
    { budget: '0' }, { budget: 'Infinity' }, { travelers: '0' }, { travelers: '1.5' },
  ]) assert.equal(isTripDraftValid({ ...valid, ...changes }), false)
  assert.equal(isTripDraftValid(createTripDraft()), false)
})
