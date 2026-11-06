import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { Page } from '../navigation'

interface SiteNavigationProps {
  page: Page
  onCurrentPageNavigate: () => void
}

export default function SiteNavigation({ page, onCurrentPageNavigate }: SiteNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  function handleNavigation(event: MouseEvent<HTMLAnchorElement>, destination: Page) {
    setMenuOpen(false)

    if (destination === page && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      onCurrentPageNavigate()
    }
  }

  return (
    <header className="site-header">
      <a className="site-name" href="#/">GeauxTravel</a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? 'Close menu' : 'Menu'}
      </button>
      <nav
        id="primary-navigation"
        className={`primary-navigation${menuOpen ? ' is-open' : ''}`}
        aria-label="Main navigation"
      >
        <a
          href="#/"
          aria-current={page === 'home' ? 'page' : undefined}
          onClick={(event) => handleNavigation(event, 'home')}
        >
          Home
        </a>
        <a
          href="#/preferences"
          aria-current={page === 'preferences' ? 'page' : undefined}
          onClick={(event) => handleNavigation(event, 'preferences')}
        >
          Plan a trip
        </a>
        <a
          href="#/trips"
          aria-current={page === 'trips' ? 'page' : undefined}
          onClick={(event) => handleNavigation(event, 'trips')}
        >
          My trips
        </a>
        <a
          href="#/flights"
          aria-current={page === 'flights' ? 'page' : undefined}
          onClick={(event) => handleNavigation(event, 'flights')}
        >
          Compare flights
        </a>
        <a
          href="#/login"
          aria-current={page === 'login' ? 'page' : undefined}
          onClick={(event) => handleNavigation(event, 'login')}
        >
          Log in
        </a>
      </nav>
    </header>
  )
}
