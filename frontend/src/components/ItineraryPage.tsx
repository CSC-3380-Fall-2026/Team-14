import type { ExampleItinerary } from '../itinerary'
import './Pages.css'

type Props = {
  itinerary: ExampleItinerary | null
  isSaved: boolean
  saveDisabled: boolean
  saveMessage: string
  onSave: () => void
  onRegenerate: () => void
}

export default function ItineraryPage({ itinerary, isSaved, saveDisabled, saveMessage, onSave, onRegenerate }: Props) {
  const preferences = itinerary?.preferences
  return (
    <section className="content-page" aria-labelledby="page-title">
      <p className="eyebrow">Guest planning · example itinerary</p>
      <h1 id="page-title">Your itinerary</h1>
      {!itinerary || !preferences ? (
        <div className="page-panel"><h2>Start with your trip preferences</h2><p>Choose a destination and dates to generate an example plan.</p><a href="#/preferences">Set trip preferences</a></div>
      ) : (
        <>
          <span className="example-badge">Example plan</span>
          <p className="page-intro">These are generic activity ideas. Places, prices, opening hours, and availability have not been verified. Check the details before making travel plans.</p>
          <section className="page-panel" aria-labelledby="trip-snapshot"><h2 id="trip-snapshot">Trip snapshot</h2>
            <dl className="trip-summary">
              <div><dt>Destination coordinates</dt><dd>{preferences.destination ? `${preferences.destination.latitude.toFixed(4)}, ${preferences.destination.longitude.toFixed(4)}` : 'No destination'}</dd></div>
              <div><dt>Dates</dt><dd>{preferences.startDate} – {preferences.endDate}</dd></div>
              <div><dt>Travelers</dt><dd>{preferences.travelers}</dd></div>
              <div><dt>Budget per traveler</dt><dd>{preferences.budget} {preferences.currency}</dd></div>
              <div><dt>Pace</dt><dd>{preferences.pace}</dd></div>
              <div><dt>Interests</dt><dd>{preferences.interests.length ? preferences.interests.join(', ') : 'No interests selected'}</dd></div>
              <div className="summary-notes"><dt>Notes</dt><dd>{preferences.notes || 'No notes added'}</dd></div>
            </dl>
            <p className="field-hint">Your budget is a planning preference. These ideas do not include cost estimates or a budget guarantee.</p>
          </section>
          <div className="itinerary-days">
            {itinerary.days.map((day, index) => <section className="page-panel" key={day.date} aria-labelledby={`itinerary-day-${index}`}><h2 id={`itinerary-day-${index}`}>Day {index + 1} · <time dateTime={day.date}>{day.date}</time></h2><ol className="activity-list">{day.activities.map((activity, activityIndex) => <li key={`${activityIndex}-${activity}`}>{activity}</li>)}</ol></section>)}
          </div>
          <div className="page-actions"><button type="button" className="page-button" disabled={saveDisabled || isSaved} onClick={onSave}>Save on this browser</button><button type="button" className="page-button secondary" onClick={onRegenerate}>Regenerate example</button></div>
          <div className="page-status" role="status" aria-live="polite">{isSaved && <p>This plan is saved on this browser.</p>}{saveMessage && <p>{saveMessage}</p>}</div>
          <p className="field-hint">Regenerating creates a new current plan. Any previous plan you saved stays in My trips. Saving is limited to this browser and does not create an account.</p>
        </>
      )}
      <nav className="page-links" aria-label="Itinerary options"><a href="#/preferences">Edit preferences</a><a href="#/trips">My trips</a><a href="#/review">Write a review draft</a><a href="#/flights">Compare flight quotes</a></nav>
    </section>
  )
}
