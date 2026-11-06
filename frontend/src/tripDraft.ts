import { getTripDates } from './calendar.ts'
import { parseMoney } from './money.ts'

export type Destination = { latitude: number; longitude: number }

export type TripPreferencesData = {
  startDate: string
  endDate: string
  budget: string
  travelers: string
  currency: 'USD' | 'EUR'
  interests: string[]
  pace: 'Relaxed' | 'Standard' | 'Active'
  notes: string
}

export type TripDraft = TripPreferencesData & { destination: Destination | null }

export type TripDraftAction =
  | { type: 'preferencesChanged'; changes: Partial<TripPreferencesData> }
  | { type: 'destinationSelected'; destination: Destination | null }

export function createTripDraft(): TripDraft {
  return {
    destination: null, startDate: '', endDate: '', budget: '', travelers: '1',
    currency: 'USD', interests: [], pace: 'Standard', notes: '',
  }
}

export function normalizeDestination(destination: Destination): Destination | null {
  const { latitude, longitude } = destination
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90) {
    return null
  }
  return { latitude, longitude: ((longitude + 180) % 360 + 360) % 360 - 180 }
}

export function tripDraftReducer(draft: TripDraft, action: TripDraftAction): TripDraft {
  if (action.type === 'preferencesChanged') return { ...draft, ...action.changes }
  if (action.destination === null) return { ...draft, destination: null }
  const destination = normalizeDestination(action.destination)
  return destination ? { ...draft, destination } : draft
}

export function isTripDraftValid(draft: TripDraft): boolean {
  try { getTripDates(draft.startDate, draft.endDate) } catch { return false }
  return draft.destination !== null && normalizeDestination(draft.destination) !== null
    && parseMoney(draft.budget) !== null
    && /^\d+$/.test(draft.travelers) && Number.isSafeInteger(Number(draft.travelers)) && Number(draft.travelers) >= 1
    && ['USD', 'EUR'].includes(draft.currency)
    && ['Relaxed', 'Standard', 'Active'].includes(draft.pace)
    && draft.interests.length <= 4 && new Set(draft.interests).size === draft.interests.length
    && draft.interests.every(interest => ['Food', 'Art', 'Outdoors', 'History'].includes(interest))
    && draft.notes.length <= 2000
}
