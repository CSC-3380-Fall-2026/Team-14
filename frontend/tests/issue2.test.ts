import assert from 'node:assert/strict'
import test from 'node:test'
import { getTripDates } from '../src/calendar.ts'
import { createTripDraft, isTripDraftValid } from '../src/tripDraft.ts'
import { generateExampleItinerary } from '../src/itinerary.ts'
import { readSavedTrips, writeSavedTrips } from '../src/savedTrips.ts'
import { parseFlightQuote, compareFlightQuotes } from '../src/flightComparison.ts'
import { validateSignup, validateReview } from '../src/accountValidation.ts'

const validDraft = () => ({ ...createTripDraft(), destination: { latitude: 30, longitude: -91 },
  startDate: '2028-02-28', endDate: '2028-03-01', budget: '300.50', travelers: '2', interests: ['Art'] })

test('calendar includes leap day and counts days independently of DST', () => {
  assert.deepEqual(getTripDates('2028-02-28', '2028-03-01'), ['2028-02-28', '2028-02-29', '2028-03-01'])
  assert.deepEqual(getTripDates('2026-11-01', '2026-11-02'), ['2026-11-01', '2026-11-02'])
})
test('impossible, reversed, malformed or oversized date ranges cannot generate a plan', () => {
  for (const [start, end] of [['2026-02-30', '2026-03-01'], ['2026-02-29', '2026-03-01'],
    ['2026-11-02', '2026-11-01'], ['tomorrow', 'tomorrow'], ['2026-01-01', '2026-02-01']]) {
    assert.throws(() => getTripDates(start, end))
    assert.equal(isTripDraftValid({ ...validDraft(), startDate: start, endDate: end }), false)
  }
})
test('money and traveler counts reject nonfinite and nondecimal input', () => {
  for (const changes of [{ budget: '1e3' }, { budget: '1.001' }, { budget: '0' }, { budget: 'Infinity' },
    { travelers: '1e2' }, { travelers: '1.5' }, { travelers: '-1' }]) {
    assert.equal(isTripDraftValid({ ...validDraft(), ...changes }), false)
  }
})
test('example generation follows dates and pace without mutating the input', () => {
  const draft = { ...validDraft(), pace: 'Relaxed' as const }
  const plan = generateExampleItinerary(draft, () => 0)
  assert.equal(plan.mode, 'example')
  assert.deepEqual(plan.days.map(day => day.date), ['2028-02-28', '2028-02-29', '2028-03-01'])
  assert.equal(plan.days[0].activities.length, 2)
  assert.ok(plan.days[0].activities.some(item => /art|gallery/i.test(item)))
  draft.destination.latitude = 40
  draft.interests.push('Food')
  assert.equal(plan.preferences.destination?.latitude, 30)
  assert.deepEqual(plan.preferences.interests, ['Art'])
})
test('active example plans contain more ideas and random choice can change them', () => {
  const draft = { ...validDraft(), pace: 'Active' as const }
  const first = generateExampleItinerary(draft, () => 0)
  const second = generateExampleItinerary(draft, () => 0.99)
  assert.equal(first.days[0].activities.length, 4)
  assert.notDeepEqual(first.days[0].activities, second.days[0].activities)
  assert.equal(new Set(first.days[0].activities).size, first.days[0].activities.length)
  assert.throws(() => generateExampleItinerary(createTripDraft()))
})

function memoryStorage() {
  const data = new Map<string, string>()
  return { getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) }, data }
}
test('explicitly saved itinerary roundtrips as an independent snapshot', () => {
  const storage = memoryStorage()
  assert.deepEqual(readSavedTrips(storage), { trips: [], error: null })
  const plan = generateExampleItinerary(validDraft(), () => 0)
  assert.equal(writeSavedTrips(storage, [plan]), null)
  const loaded = readSavedTrips(storage)
  assert.equal(loaded.error, null)
  assert.deepEqual(loaded.trips, [plan])
  plan.preferences.notes = 'Changed later'
  assert.equal(loaded.trips[0].preferences.notes, '')
  assert.equal(writeSavedTrips(storage, []), null)
  assert.deepEqual(readSavedTrips(storage).trips, [])
})
test('corrupt or unsupported saved records are reported without changing storage', () => {
  for (const raw of ['{broken', '{"version":2,"trips":[]}', '{"version":1,"trips":[{}]}']) {
    let writes = 0
    const result = readSavedTrips({ getItem: () => raw, setItem: () => { writes++ } })
    assert.ok(result.error)
    assert.deepEqual(result.trips, [])
    assert.equal(writes, 0)
  }
})
test('saved dates, activities, duplicate ids and unsupported preferences are validated', () => {
  const plan = generateExampleItinerary(validDraft(), () => 0)
  for (const trips of [[{ ...plan, days: [] }], [plan, plan],
    [{ ...plan, preferences: { ...plan.preferences, currency: 'XYZ' } }],
    [{ ...plan, days: [{ date: '2028-02-28', activities: [''] }] }]]) {
    const result = readSavedTrips({ getItem: () => JSON.stringify({ version: 1, trips }), setItem: () => {} })
    assert.ok(result.error)
  }
})
test('denied or full storage cannot report a successful read or save', () => {
  const storage = { getItem: (): string => { throw new Error('Denied') },
    setItem: () => { throw new Error('Quota') } }
  assert.ok(readSavedTrips(storage).error)
  assert.ok(writeSavedTrips(storage, [generateExampleItinerary(validDraft())]))
})

test('saving projects only known coordinate fields and excludes unexpected nested details', () => {
  const draft = validDraft()
  Object.assign(draft.destination, { password: 'synthetic-not-a-credential' })
  const storage = memoryStorage()
  assert.equal(writeSavedTrips(storage, [generateExampleItinerary(draft)]), null)
  assert.equal([...storage.data.values()].join('').includes('synthetic-not-a-credential'), false)
})
test('invalid timestamps cannot be written as successful saved plans', () => {
  const plan = generateExampleItinerary(validDraft())
  let writes = 0
  const storage = { getItem: () => null, setItem: () => { writes++ } }
  assert.ok(writeSavedTrips(storage, [{ ...plan, createdAt: '2028-02-28' + ' '.repeat(1000000) }]))
  assert.equal(writes, 0)
})

const quoteFields = () => ({ airline: 'Example Air', origin: 'btr', destination: 'jfk',
  departureDate: '2026-12-01', returnDate: '', tripType: 'one-way', price: '123.45',
  currency: 'USD', durationMinutes: '180', stops: '0' })
test('quotes normalize airport codes and preserve exact entered cents', () => {
  const result = parseFlightQuote(quoteFields())
  assert.deepEqual(result.errors, {})
  assert.equal(result.quote?.origin, 'BTR')
  assert.equal(result.quote?.priceMinor, 12345)
})
test('invalid fares, durations, routes, dates and round trips are rejected', () => {
  for (const changes of [{ price: '1.001' }, { price: '-1' }, { price: 'Infinity' },
    { price: '1e3' }, { durationMinutes: '0' }, { stops: '1.5' }, { destination: 'BTR' },
    { departureDate: '2026-02-30' }, { tripType: 'round-trip', returnDate: '' },
    { tripType: 'round-trip', returnDate: '2026-11-30' }, { currency: 'GBP' }]) {
    const result = parseFlightQuote({ ...quoteFields(), ...changes })
    assert.equal(result.quote, null)
    assert.ok(Object.keys(result.errors).length > 0)
  }
})
test('comparison ranks matching quotes by price then duration without mutating input', () => {
  const a = parseFlightQuote(quoteFields()).quote!
  const b = parseFlightQuote({ ...quoteFields(), price: '90', airline: 'Second Air' }).quote!
  const input = [a, b]
  assert.deepEqual(compareFlightQuotes(input, 'price').map(item => item.airline), ['Second Air', 'Example Air'])
  assert.deepEqual(input.map(item => item.airline), ['Example Air', 'Second Air'])
})
test('comparison refuses unlike currencies, routes, dates and trip types', () => {
  const a = parseFlightQuote(quoteFields()).quote!
  for (const changes of [{ currency: 'EUR' as const }, { origin: 'MSY' }, { departureDate: '2026-12-02' },
    { tripType: 'round-trip' as const, returnDate: '2026-12-03' }]) {
    assert.throws(() => compareFlightQuotes([a, { ...a, ...changes }], 'price'))
  }
})
test('signup validates entries without creating an identity', () => {
  assert.deepEqual(validateSignup({ email: 'student@example.com', password: 'some password', confirmation: 'some password' }), {})
  const errors = validateSignup({ email: 'wrong', password: ' ', confirmation: 'different' })
  assert.ok(errors.email)
  assert.ok(errors.password)
  assert.ok(errors.confirmation)
})
test('review requires a bounded text, subject and an integer rating from one to five', () => {
  assert.deepEqual(validateReview({ subject: 'Weekend trip', rating: '4', text: 'The map was easy to use.' }), {})
  for (const rating of ['', '0', '6', '2.5']) assert.ok(validateReview({ subject: 'Trip', rating, text: 'Good' }).rating)
  const errors = validateReview({ subject: ' ', rating: '4', text: 'x'.repeat(2001) })
  assert.ok(errors.subject)
  assert.ok(errors.text)
})
