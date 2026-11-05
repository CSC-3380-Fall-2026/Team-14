import { useEffect, useRef, useState } from 'react'
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import SiteNavigation from './components/SiteNavigation'
import { resolvePage } from './navigation'
import './App.css'
import TripPreferences from './TripPreferences'

function App() {
  const [page, setPage] = useState(() => resolvePage(window.location.hash))
  const mainContent = useRef<HTMLElement>(null)
  const previousPage = useRef(page)

  useEffect(() => {
    function handleHashChange() {
      setPage(resolvePage(window.location.hash))
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    document.title = {
      home: 'GeauxTravel',
      login: 'Log in | GeauxTravel',
      preferences: 'Trip preferences | GeauxTravel',
    }[page]

    if (previousPage.current !== page) {
      mainContent.current?.focus()
      previousPage.current = page
    }
  }, [page])

  return (
    <div className="site">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          mainContent.current?.focus()
          mainContent.current?.scrollIntoView()
        }}
      >
        Skip to content
      </a>
      <SiteNavigation
        key={page}
        page={page}
        onCurrentPageNavigate={() => mainContent.current?.focus()}
      />
      <main
        ref={mainContent}
        id="main-content"
        className={page}
        tabIndex={-1}
        aria-labelledby="page-title"
      >
        {page === 'login' ? <LoginPage /> : page === 'preferences' ? (
          <section aria-labelledby="page-title">
            <h1 id="page-title">Plan your trip</h1>
            <p className="preferences-intro">Choose your dates, budget, and interests.</p>
            <TripPreferences />
            <a className="return-home" href="#/">Back to the map</a>
          </section>
        ) : <HomePage />}
      </main>
    </div>
  )
}

export default App
