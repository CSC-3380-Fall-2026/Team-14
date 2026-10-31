import { useEffect, useRef, useState } from 'react'
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import SiteNavigation from './components/SiteNavigation'
import { resolvePage } from './navigation'
import './App.css'

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
    document.title = page === 'login' ? 'Log in | GeauxTravel' : 'GeauxTravel'

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
        className={page === 'login' ? 'login' : 'home'}
        tabIndex={-1}
        aria-labelledby="page-title"
      >
        {page === 'login' ? <LoginPage /> : <HomePage />}
      </main>
    </div>
  )
}

export default App
