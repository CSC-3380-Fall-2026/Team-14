import { isTripDraftValid, type TripDraft, type TripPreferencesData } from './tripDraft'
import { getTripDates } from './calendar'
import { parseMoney } from './money'
import './App.css'

type TripPreferencesProps = {
  draft: TripDraft
  onPreferencesChange: (changes: Partial<TripPreferencesData>) => void
  onPreview: () => void
  planningError: string
}

function TripPreferences({ draft, onPreferencesChange, onPreview, planningError }: TripPreferencesProps) {
  const {
    destination, startDate, endDate, budget, travelers, currency, interests, pace, notes,
  } = draft

  function handleInterestChange(event: React.ChangeEvent<HTMLInputElement>) {
    const interest = event.target.value
    onPreferencesChange({
      interests: event.target.checked
        ? [...interests, interest]
        : interests.filter((item) => item !== interest),
    })
  }

  const budgetIsValid = parseMoney(budget) !== null
  const travelersAreValid = /^\d+$/.test(travelers) && Number(travelers) >= 1 && Number.isSafeInteger(Number(travelers))
  let dateError = ''
  if (startDate && endDate) {
    try { getTripDates(startDate, endDate) } catch (error) {
      dateError = error instanceof Error ? error.message : 'Check your travel dates.'
    }
  }

  return (
    <div className="trip-preferences">
      <div className="trip-destination" aria-labelledby="trip-destination-title">
        <h2 id="trip-destination-title">Destination</h2>
        {destination ? (
          <>
            <p>
              Latitude: {destination.latitude.toFixed(5)}
              <br />
              Longitude: {destination.longitude.toFixed(5)}
            </p>
            <a href="#/">Change destination</a>
          </>
        ) : (
          <p><a href="#/">Choose a destination on the map</a></p>
        )}
        <p className="trip-draft-notice">
          Your draft stays while you move between pages. Refreshing clears it.
          It is not saved to an account.
        </p>
      </div>

      <div>
        <label htmlFor="startDate">Start date</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(event) => onPreferencesChange({ startDate: event.target.value })}
        />

        <label htmlFor="endDate">End date</label>
        <input
          id="endDate"
          type="date"
          min={startDate}
          value={endDate}
          onChange={(event) => onPreferencesChange({ endDate: event.target.value })}
        />

        <p>Start date: {startDate}</p>
        <p>End date: {endDate}</p>
        <p>Example plans can cover up to 31 days.</p>
        {dateError && <p role="alert">{dateError}</p>}
      </div>

      <div>
        <label htmlFor="budget">Budget per traveler</label>
        <input
          id="budget"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="For example, 300"
          value={budget}
          onChange={(event) => onPreferencesChange({ budget: event.target.value })}
        />
        <label htmlFor="currency">Currency</label>
        <select
          id="currency"
          value={currency}
          onChange={(event) => onPreferencesChange({
            currency: event.target.value as TripPreferencesData['currency'],
          })}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
        <p>Budget per traveler: {budget} {currency}</p>
        {budget && !budgetIsValid && (
          <p role="alert">Enter a positive budget with up to two decimal places.</p>
        )}
      </div>

      <div>
        <label htmlFor="travelers">Number of travelers</label>
        <input
          id="travelers"
          type="number"
          min="1"
          step="1"
          value={travelers}
          onChange={(event) => onPreferencesChange({ travelers: event.target.value })}
        />
        <p>Travelers: {travelers}</p>
        {!travelersAreValid && (
          <p role="alert">Number of travelers must be a whole number and at least 1</p>
        )}
      </div>

      <fieldset>
        <legend>Interests</legend>
        {['Food', 'Art', 'Outdoors', 'History'].map((interest) => (
          <label key={interest}>
            <input
              type="checkbox"
              value={interest}
              checked={interests.includes(interest)}
              onChange={handleInterestChange}
            />
            {interest}
          </label>
        ))}
      </fieldset>
      <p>Selected interests: {interests.length > 0 ? interests.join(', ') : 'None selected'}</p>

      <fieldset>
        <legend>Daily pace</legend>
        {(['Relaxed', 'Standard', 'Active'] as const).map((option) => (
          <label key={option}>
            <input
              type="radio"
              name="pace"
              value={option}
              checked={pace === option}
              onChange={() => onPreferencesChange({ pace: option })}
            />
            {option}
          </label>
        ))}
      </fieldset>

      <div className="notes-field">
        <label htmlFor="notes">Food preferences or notes (optional)</label>
        <textarea
          id="notes"
          rows={3}
          maxLength={2000}
          placeholder="For example: vegetarian food or time to rest"
          value={notes}
          onChange={(event) => onPreferencesChange({ notes: event.target.value })}
        />
      </div>

      <p>Daily pace: {pace}</p>
      <p>Notes: {notes || 'No notes added'}</p>

      <button
        type="button"
        disabled={!isTripDraftValid(draft)}
        onClick={onPreview}
      >
        Preview example itinerary
      </button>
      <p>Choose a destination, valid dates, a budget, and a traveler count to preview a plan. The example uses general activity ideas, not live venue results or verified prices.</p>
      {planningError && <p role="alert">{planningError}</p>}
    </div>
  )
}

export default TripPreferences
