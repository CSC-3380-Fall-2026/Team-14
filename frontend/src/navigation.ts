export type Page = 'home' | 'login'

export function resolvePage(hash: string): Page {
  return hash === '#/login' ? 'login' : 'home'
}
