import { copyTripDraft, type ExampleItinerary } from './itinerary.ts'
import { isTripDraftValid, type TripDraft } from './tripDraft.ts'
import { getTripDates } from './calendar.ts'

export const MAX_SAVED_TRIPS = 20
const key = 'geauxtravel.saved-trips.v1'
export type TripStorage = Pick<Storage, 'getItem' | 'setItem'>
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

function readPlan(value: unknown): ExampleItinerary {
  if (!record(value) || value.mode !== 'example' || typeof value.id !== 'string' || !value.id || value.id.length > 100
    || typeof value.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.createdAt)
    || !Number.isFinite(Date.parse(value.createdAt)) || new Date(value.createdAt).toISOString() !== value.createdAt) throw new Error('Invalid plan')
  const draft = value.preferences
  if (!record(draft) || !record(draft.destination)
    || typeof draft.destination.latitude !== 'number' || typeof draft.destination.longitude !== 'number'
    || !['startDate', 'endDate', 'budget', 'travelers', 'currency', 'pace', 'notes'].every(field => typeof draft[field] === 'string')
    || !Array.isArray(draft.interests) || !draft.interests.every(item => typeof item === 'string')
    || !isTripDraftValid(draft as TripDraft)) throw new Error('Invalid preferences')
  const preferences = copyTripDraft(draft as TripDraft)
  const dates = getTripDates(preferences.startDate, preferences.endDate)
  if (!Array.isArray(value.days) || value.days.length !== dates.length) throw new Error('Invalid days')
  const days = value.days.map((day, index) => {
    if (!record(day) || day.date !== dates[index] || !Array.isArray(day.activities)
      || day.activities.length < 1 || day.activities.length > 4
      || !day.activities.every(item => typeof item === 'string' && item.trim().length > 0 && item.length <= 160)) {
      throw new Error('Invalid activities')
    }
    return { date: dates[index], activities: [...day.activities] as string[] }
  })
  return { id: value.id, createdAt: value.createdAt, mode: 'example', preferences, days }
}

function readPlans(value: unknown): ExampleItinerary[] {
  if (!Array.isArray(value) || value.length > MAX_SAVED_TRIPS) throw new Error('Invalid saved trips')
  const trips = value.map(readPlan)
  if (new Set(trips.map(trip => trip.id)).size !== trips.length) throw new Error('Duplicate saved trips')
  return trips
}

export function readSavedTrips(storage: TripStorage): { trips: ExampleItinerary[]; error: string | null } {
  try {
    const raw = storage.getItem(key)
    if (raw === null) return { trips: [], error: null }
    if (raw.length > 1000000) throw new Error('Saved data too large')
    const data: unknown = JSON.parse(raw)
    if (!record(data) || data.version !== 1) throw new Error('Unsupported data')
    return { trips: readPlans(data.trips), error: null }
  } catch {
    return { trips: [], error: 'Saved trips could not be read. Nothing has been overwritten.' }
  }
}

export function writeSavedTrips(storage: TripStorage, trips: ExampleItinerary[]): string | null {
  try {
    const serialized = JSON.stringify({ version: 1, trips: readPlans(trips) })
    if (serialized.length > 1000000) throw new Error('Saved data too large')
    storage.setItem(key, serialized)
    return null
  } catch {
    return 'Could not save this change. Your browser storage may be unavailable or full.'
  }
}
