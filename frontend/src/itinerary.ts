import { getTripDates } from './calendar.ts'
import { isTripDraftValid, type TripDraft } from './tripDraft.ts'

export type ExampleItinerary = {
  id: string
  createdAt: string
  mode: 'example'
  preferences: TripDraft
  days: { date: string; activities: string[] }[]
}

const ideas: Record<string, string[]> = {
  Food: ['Try a local lunch spot', 'Look for a food market', 'Take a break at a cafe'],
  Art: ['Visit a local art gallery', 'Look for public art', 'Explore an arts district'],
  Outdoors: ['Take a park walk', 'Explore a public garden', 'Find a scenic walking route'],
  History: ['Visit a local history museum', 'Explore a historic neighborhood', 'Look for a heritage walking tour'],
}
const generalIdeas = ['Explore the neighborhood on foot', 'Leave time for a relaxed meal',
  'Browse local shops', 'Take an afternoon break', 'Find a public viewpoint', 'Leave the evening open']

export function copyTripDraft(draft: TripDraft): TripDraft {
  return { destination: draft.destination ? { latitude: draft.destination.latitude, longitude: draft.destination.longitude } : null,
    startDate: draft.startDate, endDate: draft.endDate, budget: draft.budget,
    travelers: draft.travelers, currency: draft.currency, interests: [...draft.interests],
    pace: draft.pace, notes: draft.notes }
}

export function generateExampleItinerary(draft: TripDraft, random: () => number = Math.random): ExampleItinerary {
  if (!isTripDraftValid(draft)) throw new Error('Choose a destination and check your dates, budget, and traveler count.')
  const perDay = { Relaxed: 2, Standard: 3, Active: 4 }[draft.pace]
  const selected = draft.interests.flatMap(interest => ideas[interest])
  const candidates = [...selected, ...generalIdeas]
  const pick = (items: string[]) => items.splice(Math.min(items.length - 1,
    Math.max(0, Math.floor(random() * items.length))), 1)[0]
  const days = getTripDates(draft.startDate, draft.endDate).map(date => {
    const pool = [...candidates]
    const activities: string[] = []
    if (selected.length) {
      const first = pick([...selected])
      activities.push(first)
      pool.splice(pool.indexOf(first), 1)
    }
    while (activities.length < perDay) activities.push(pick(pool))
    return { date, activities }
  })
  return { id: crypto.randomUUID(), createdAt: new Date().toISOString(), mode: 'example',
    preferences: copyTripDraft(draft), days }
}
