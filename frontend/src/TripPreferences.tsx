import { useState } from 'react'
import './App.css'

function TripPreferences() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const [budget, setBudget] = useState('')
    const [travelers, setTravelers] = useState('1')

    const [currency, setCurrency] = useState('USD')

    const [interests, setInterests] = useState<string[]>([])

    const [pace, setPace] = useState('Standard')
    const [notes, setNotes] = useState('')

function handleInterestChange(event: React.ChangeEvent<HTMLInputElement>) {
    const interest = event.target.value
    const isChecked = event.target.checked

  setInterests((previousInterests) => {
    if (isChecked) {
      return [...previousInterests, interest]
    }

    return previousInterests.filter((item) => item !== interest)
  })
}

    const datesAreValid = startDate && endDate && (endDate >= startDate)
    const budgetIsValid = budget && Number(budget) > 0
    const travelersAreValid = Number(travelers) >= 1 && Number.isInteger(Number(travelers))
    const formIsValid = datesAreValid && budgetIsValid && travelersAreValid

    return (
    <div>
{/* Start and End dates*/}
    <div>    
        <label htmlFor="startDate">Start date</label>

        <input
        id="startDate"
        type="date"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
        />

        <label htmlFor="endDate">End date</label>
        <input
        id="endDate"
        type="date"
        min={startDate}
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
        />    

        <p>Start date: {startDate}</p>
        <p>End date: {endDate}</p>

    {startDate && endDate && endDate < startDate && (
      <p role="alert">
        End date cannot be before start date.
      </p>
    )}
    </div>

{/*Budget per traveler*/}
    <div>
      <label htmlFor="budget">Budget per traveler </label>

      <input
        id="budget"
        type="number"
        min="0.01"
        step="0.01"
        placeholder="For example, 300"
        value={budget}
        onChange={(event) => setBudget(event.target.value)}
      />
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
      >   
        <option value="USD"> USD </option>
        <option value="EUR"> EUR </option>
      </select>  
 
    <p>Budget per traveler: {budget} {currency}</p>

    {budget && !budgetIsValid && (
        <p role="alert">
            Budget must be greater than 0
        </p>
    )}
    </div>

{/*Number of travelers*/}
    <div>
      <label htmlFor="travelers">Number of travelers</label>

      <input
        id="travelers"
        type="number"
        min="1"
        step="1"
        value={travelers}
        onChange={(event) => setTravelers(event.target.value)}
      />
      <p>Travelers: {travelers}</p>
      {!travelersAreValid && (
        <p role="alert">
            Number of travelers must be a whole number and at least 1
        </p>
    )}
    </div>

{/*Interests*/}
<fieldset>
  <legend>Interests</legend>

  {['Food', 'Art', 'Outdoors', 'History'].map((interest) => (
    <label key={interest} style={{ display: 'block' }}>
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

<p>
  Selected interests:{' '}
  {interests.length > 0 ? interests.join(', ') : 'None selected'}
</p>

{/*Daily pace and Notes*/}
<div>
  <input
  type="radio"
  name="pace"
  value="Relaxed"
  checked={pace === 'Relaxed'}
  onChange={(event) => setPace(event.target.value)}
  />
  Relaxed
  <input
  type="radio"
  name="pace"
  value="Standard"
  checked={pace === 'Standard'}
  onChange={(event) => setPace(event.target.value)}
  />
  Standard
  <input
  type="radio"
  name="pace"
  value="Active"
  checked={pace === 'Active'}
  onChange={(event) => setPace(event.target.value)}
  />
  Active
</div>

<div>
  <label htmlFor="notes">
    Food preferences or notes (optional)
  </label>

  <textarea
    id="notes"
    rows="3"
    placeholder="For example: vegetarian food or time to rest"
    value={notes}
    onChange={(event) => setNotes(event.target.value)}
  />
</div>

<p>Daily pace: {pace}</p>
<p>Notes: {notes || 'No notes added'}</p>

    <button disabled={!formIsValid}>
    Generate itinerary
    </button>

    </div>

    )
}

export default TripPreferences