export type Page = 'home' | 'login' | 'map'

export function resolvePage(hash: string): Page {
  return hash === '#/login' ? 'login' : 'home'
}
