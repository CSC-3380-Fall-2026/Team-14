export type Page = 'home' | 'login' | 'preferences'

export function resolvePage(hash: string): Page {
  if (hash === '#/login') return 'login'
  if (hash === '#/preferences') return 'preferences'
  return 'home'
}
