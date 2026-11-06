import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage'
import SiteNavigation from './components/SiteNavigation'
import SignupPage from './components/SignupPage'
import MyTripsPage from './components/MyTripsPage'
import ItineraryPage from './components/ItineraryPage'
import ReviewPage from './components/ReviewPage'
import FlightsPage from './components/FlightsPage'
import { resolvePage } from './navigation'
import './App.css'
import TripPreferences from './TripPreferences'
import { createTripDraft, tripDraftReducer, type Destination, type TripPreferencesData } from './tripDraft'
import { copyTripDraft, generateExampleItinerary, type ExampleItinerary } from './itinerary'
import { MAX_SAVED_TRIPS, readSavedTrips, writeSavedTrips } from './savedTrips'
import type { ReviewFields } from './accountValidation'
import type { FlightQuote } from './flightComparison'
import './components/Pages.css'

function readBrowserTrips() {
  try { return readSavedTrips(window.localStorage) } catch {
    return { trips: [] as ExampleItinerary[], error: 'Browser storage is unavailable. Saved trips could not be read.' }
  }
}

function persistTrips(trips: ExampleItinerary[]) {
  try { return writeSavedTrips(window.localStorage, trips) } catch {
    return 'Could not save this change. Browser storage is unavailable.'
  }
}

function App() {
  const [page, setPage] = useState(() => resolvePage(window.location.hash))
  const [draft, dispatch] = useReducer(tripDraftReducer, undefined, createTripDraft)
  const [savedState, setSavedState] = useState(readBrowserTrips)
  const [itinerary, setItinerary] = useState<ExampleItinerary | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [tripsStatus, setTripsStatus] = useState('')
  const [planningError, setPlanningError] = useState('')
  const [reviewDraft, setReviewDraft] = useState<ReviewFields>({ subject: '', rating: '', text: '' })
  const [reviewSaved, setReviewSaved] = useState(false)
  const [quotes, setQuotes] = useState<FlightQuote[]>([])
  const mainContent = useRef<HTMLElement>(null)
  const previousPage = useRef(page)
  const changeDestination = useCallback((destination: Destination | null) => {
    dispatch({ type: 'destinationSelected', destination })
  }, [])
  const changePreferences = useCallback((changes: Partial<TripPreferencesData>) => {
    dispatch({ type: 'preferencesChanged', changes })
    setPlanningError('')
  }, [])

  function previewTrip() {
    try {
      setItinerary(generateExampleItinerary(draft))
      setPlanningError('')
      setSaveMessage('')
      window.location.hash = '#/itinerary'
    } catch (error) {
      setPlanningError(error instanceof Error ? error.message : 'Check your trip details.')
    }
  }

  function saveTrip() {
    if (!itinerary || savedState.error) return
    const latest = readBrowserTrips()
    if (latest.error) { setSavedState(latest); setSaveMessage(latest.error); return }
    if (latest.trips.some(trip => trip.id === itinerary.id)) {
      setSavedState(latest)
      setSaveMessage('This plan is already saved on this browser.')
      return
    }
    if (latest.trips.length >= MAX_SAVED_TRIPS) {
      setSaveMessage(`You have ${MAX_SAVED_TRIPS} saved plans. Delete one in My trips before saving another.`)
      return
    }
    const trips = [itinerary, ...latest.trips]
    const error = persistTrips(trips)
    setSaveMessage(error ?? 'Saved on this browser. Open My trips to find it again.')
    if (!error) { setSavedState({ trips, error: null }); setTripsStatus('') }
  }

  function deleteTrip(id: string) {
    const latest = readBrowserTrips()
    if (latest.error) { setSavedState(latest); return }
    const trips = latest.trips.filter(trip => trip.id !== id)
    const error = persistTrips(trips)
    setTripsStatus(error ?? 'Saved plan deleted from this browser.')
    if (!error) {
      setSavedState({ trips, error: null })
      setSaveMessage('')
    }
  }

  function resetSavedTrips() {
    const error = persistTrips([])
    setTripsStatus(error ?? 'Saved trip data cleared on this browser.')
    if (!error) {
      setSavedState({ trips: [], error: null })
      setSaveMessage('')
    }
  }

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
      signup: 'Create an account | GeauxTravel',
      trips: 'My trips | GeauxTravel',
      itinerary: 'Example itinerary | GeauxTravel',
      review: 'Write a review | GeauxTravel',
      flights: 'Compare flights | GeauxTravel',
    }[page]

    if (previousPage.current !== page) {
      mainContent.current?.focus()
      mainContent.current?.scrollIntoView({ block: 'start' })
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
        {page === 'login' ? <LoginPage /> : page === 'signup' ? <SignupPage />
          : page === 'trips' ? <MyTripsPage trips={savedState.trips} storageError={savedState.error} status={tripsStatus}
            onOpen={trip => {
              const { destination, ...preferences } = copyTripDraft(trip.preferences)
              dispatch({ type: 'destinationSelected', destination })
              dispatch({ type: 'preferencesChanged', changes: preferences })
              setItinerary(trip); setSaveMessage(''); window.location.hash = '#/itinerary'
            }}
            onDelete={deleteTrip} onReset={resetSavedTrips} />
          : page === 'itinerary' ? <ItineraryPage itinerary={itinerary}
            isSaved={!!itinerary && savedState.trips.some(trip => trip.id === itinerary.id)}
            saveDisabled={savedState.error !== null} saveMessage={saveMessage || savedState.error || ''}
            onSave={saveTrip} onRegenerate={() => {
              if (itinerary) { setItinerary(generateExampleItinerary(itinerary.preferences)); setSaveMessage('') }
            }} />
          : page === 'review' ? <ReviewPage draft={reviewDraft} saved={reviewSaved}
            onChange={changes => { setReviewDraft(current => ({ ...current, ...changes })); setReviewSaved(false) }}
            onSave={() => setReviewSaved(true)} onClear={() => { setReviewDraft({ subject: '', rating: '', text: '' }); setReviewSaved(false) }} />
          : page === 'flights' ? <FlightsPage quotes={quotes} onQuotesChange={setQuotes} />
          : page === 'preferences' ? (
          <section aria-labelledby="page-title">
            <h1 id="page-title">Plan your trip</h1>
            <p className="preferences-intro">Choose your dates, budget, and interests.</p>
            <TripPreferences draft={draft} onPreferencesChange={changePreferences} onPreview={previewTrip} planningError={planningError} />
            <a className="return-home" href="#/">Back to the map</a>
          </section>
        ) : <HomePage destination={draft.destination} onDestinationChange={changeDestination} />}
      </main>
    </div>
  )
}

export default App
