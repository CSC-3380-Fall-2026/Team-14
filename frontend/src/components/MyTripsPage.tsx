import { useRef, useState } from 'react'
import type { ExampleItinerary } from '../itinerary'
import './Pages.css'

type Props = {
  trips: ExampleItinerary[]
  storageError: string | null
  status: string
  onOpen: (trip: ExampleItinerary) => void
  onDelete: (id: string) => void
  onReset: () => void
}

export default function MyTripsPage({ trips, storageError, status, onOpen, onDelete, onReset }: Props) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  function remove(id: string) {
    onDelete(id)
    setPendingDelete(null)
    headingRef.current?.focus()
  }

  function reset() {
    onReset()
    setConfirmReset(false)
    setPendingDelete(null)
    headingRef.current?.focus()
  }

  return (
    <section className="content-page" aria-labelledby="page-title">
      <p className="eyebrow">Guest planning · this browser only</p>
      <h1 id="page-title">My trips</h1>
      <p className="page-intro">Saved example plans stay in this browser on this device. They are not saved to an account or synced elsewhere. Clearing browser data can remove them. Other people using this browser profile can see these plans.</p>
      <p className="scope-notice">You are signed out. <a href="#/signup">Explore sign up</a> or <a href="#/login">log in</a> to view the account forms; account access is not connected yet.</p>
      <div className="page-status" role="status" aria-live="polite">{status && <p>{status}</p>}</div>
      {storageError && <p className="form-error-summary" role="alert">{storageError} Browser saving is unavailable until this is resolved. You can reset saved data below to try again.</p>}
      <h2 ref={headingRef} tabIndex={-1} className="stable-heading">Saved on this browser ({trips.length}/20)</h2>
      <p className="field-hint">Keep up to 20 plans here. Delete an older plan when you need room.</p>
      {trips.length === 0 ? (
        <div className="page-panel"><h3>No saved plans yet</h3><p>Choose your trip preferences, generate an example itinerary, then save it on this browser.</p><a href="#/preferences">Start planning</a></div>
      ) : (
        <ul className="plan-grid">
          {trips.map((trip, index) => (
            <li className="page-panel plan-card" key={trip.id}>
              <span className="example-badge">Example plan</span>
              <h3>Trip {index + 1}: {trip.preferences.startDate} – {trip.preferences.endDate}</h3>
              <dl className="compact-details">
                <div><dt>Destination coordinates</dt><dd>{trip.preferences.destination ? `${trip.preferences.destination.latitude.toFixed(4)}, ${trip.preferences.destination.longitude.toFixed(4)}` : 'No destination'}</dd></div>
                <div><dt>Pace</dt><dd>{trip.preferences.pace}</dd></div>
                <div><dt>Travelers</dt><dd>{trip.preferences.travelers}</dd></div>
              </dl>
              <div className="page-actions"><button type="button" className="page-button" onClick={() => onOpen(trip)} aria-label={`Open example trip ${index + 1}`}>Open plan</button><button type="button" className="page-button secondary" onClick={() => setPendingDelete(trip.id)} aria-label={`Delete example trip ${index + 1}`}>Delete</button></div>
              {pendingDelete === trip.id && <div className="confirm-panel" role="group" aria-label={`Confirm deleting trip ${index + 1}`}><p>Delete this saved plan from this browser?</p><div className="page-actions"><button type="button" className="page-button danger" onClick={() => remove(trip.id)}>Yes, delete plan</button><button type="button" className="page-button secondary" onClick={() => { setPendingDelete(null); headingRef.current?.focus() }}>Keep plan</button></div></div>}
            </li>
          ))}
        </ul>
      )}
      <div className="reset-section">
        <button type="button" className="page-button secondary" onClick={() => setConfirmReset(true)}>Reset saved data</button>
        {confirmReset && <div className="confirm-panel" role="group" aria-label="Confirm resetting saved plans"><p>Remove all saved plans from this browser? This cannot be undone.</p><div className="page-actions"><button type="button" className="page-button danger" onClick={reset}>Yes, reset saved data</button><button type="button" className="page-button secondary" onClick={() => { setConfirmReset(false); headingRef.current?.focus() }}>Cancel reset</button></div></div>}
      </div>
      <nav className="page-links" aria-label="Trip planning"><a href="#/preferences">Plan another trip</a></nav>
    </section>
  )
}
