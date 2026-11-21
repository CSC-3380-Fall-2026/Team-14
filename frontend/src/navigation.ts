export type Page = 'home' | 'login' | 'preferences' | 'signup' | 'trips' | 'itinerary' | 'review' | 'flights'

export function resolvePage(hash: string): Page {
  if (hash === '#/login') return 'login'
  if (hash === '#/preferences') return 'preferences'
  if (hash === '#/signup') return 'signup'
  if (hash === '#/trips') return 'trips'
  if (hash === '#/itinerary') return 'itinerary'
  if (hash === '#/review') return 'review'
  if (hash === '#/flights') return 'flights'
  return 'home'
}
