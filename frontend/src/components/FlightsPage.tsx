import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { compareFlightQuotes, parseFlightQuote } from '../flightComparison'
import type { FlightQuote, FlightQuoteErrors, FlightQuoteFields, FlightSort } from '../flightComparison'
import './Pages.css'

type Props = { quotes: FlightQuote[]; onQuotesChange: (quotes: FlightQuote[]) => void }
const fieldOrder: (keyof FlightQuoteFields)[] = ['airline', 'tripType', 'origin', 'destination', 'departureDate', 'returnDate', 'currency', 'price', 'durationMinutes', 'stops']
function emptyFields(first?: FlightQuote): FlightQuoteFields {
  return { airline: '', origin: first?.origin ?? '', destination: first?.destination ?? '', departureDate: first?.departureDate ?? '', returnDate: first?.returnDate ?? '', tripType: first?.tripType ?? 'one-way', currency: first?.currency ?? 'USD', price: '', durationMinutes: '', stops: '' }
}

export default function FlightsPage({ quotes, onQuotesChange }: Props) {
  const [fields, setFields] = useState<FlightQuoteFields>(() => emptyFields(quotes[0]))
  const [errors, setErrors] = useState<FlightQuoteErrors>({})
  const [comparisonError, setComparisonError] = useState('')
  const [sort, setSort] = useState<FlightSort>('price')
  const [status, setStatus] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const locked = quotes.length > 0
  const sortedQuotes = compareFlightQuotes(quotes, sort)

  function change(key: keyof FlightQuoteFields, value: string) {
    setFields(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: undefined }))
    setComparisonError('')
    setStatus('')
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    setComparisonError('')
    const parsed = parseFlightQuote(fields)
    setErrors(parsed.errors)
    if (!parsed.quote) {
      const first = fieldOrder.find(key => parsed.errors[key])
      if (first) (formRef.current?.elements.namedItem(first) as HTMLInputElement | HTMLSelectElement | null)?.focus()
      return
    }
    try { compareFlightQuotes([...quotes, parsed.quote], 'price') } catch (error) {
      setComparisonError(error instanceof Error ? error.message : 'Check that all quotes use the same route, dates, trip type, and currency.')
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    onQuotesChange([...quotes, parsed.quote])
    setFields(emptyFields(parsed.quote))
    setConfirmReset(false)
    setStatus(`${parsed.quote.airline} quote added to this visit's comparison.`)
    ;(formRef.current?.elements.namedItem('airline') as HTMLInputElement | null)?.focus()
  }

  function remove(quote: FlightQuote) {
    onQuotesChange(quotes.filter(item => item.id !== quote.id))
    setStatus(`${quote.airline} quote removed.`)
    headingRef.current?.focus()
  }

  function reset() {
    onQuotesChange([])
    setFields(emptyFields())
    setErrors({})
    setComparisonError('')
    setConfirmReset(false)
    setStatus('Comparison and entered quote details cleared.')
    headingRef.current?.focus()
  }

  function textField(key: keyof FlightQuoteFields, label: string, options: { type?: string; hint?: string; locked?: boolean; maxLength?: number; min?: string; max?: string; step?: string; inputMode?: 'decimal' | 'numeric' | 'text' } = {}) {
    const hintId = options.hint ? `flight-${key}-hint` : ''
    const errorId = errors[key] ? `flight-${key}-error` : ''
    return <div className="form-field"><label htmlFor={`flight-${key}`}>{label}</label><input id={`flight-${key}`} name={key} type={options.type ?? 'text'} required value={fields[key]} readOnly={options.locked} maxLength={options.maxLength} min={options.min} max={options.max} step={options.step} inputMode={options.inputMode} onChange={event => change(key, event.target.value)} aria-invalid={errors[key] ? true : undefined} aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined} />{options.hint && <p className="field-hint" id={hintId}>{options.hint}</p>}{errors[key] && <p className="field-error" id={errorId}>{errors[key]}</p>}</div>
  }

  return (
    <section className="content-page" aria-labelledby="page-title">
      <p className="eyebrow">Manual flight comparison · this visit only</p>
      <h1 id="page-title">Compare flight quotes</h1>
      <p className="page-intro">Enter quotes you found to compare price and journey time. This page does not search live fares, verify offers, or book flights.</p>
      <p className="scope-notice" id="flight-scope">Quotes stay available while you move between pages during this visit. Refreshing clears them. Use the total price per traveler including all fees, and duration and stops for the entire quoted journey. Round-trip quotes must include both directions.</p>
      <section className="page-panel" aria-labelledby="flight-add-heading">
        <h2 id="flight-add-heading">{locked ? 'Add another quote' : 'Add your first quote'}</h2>
        {locked && <p className="field-hint" id="flight-shared-hint">All quotes share the airports, dates, trip type, and currency below so the comparison is consistent. Reset the comparison to change these details.</p>}
        <form ref={formRef} noValidate onSubmit={add} aria-describedby={`flight-scope${locked ? ' flight-shared-hint' : ''}`}>
          {Object.values(errors).some(Boolean) && <p className="form-error-summary" role="alert">Check the highlighted fields below.</p>}
          {comparisonError && <p className="form-error-summary" role="alert" tabIndex={-1} ref={errorRef}>{comparisonError} Your entered details have been kept.</p>}
          {textField('airline', 'Airline or quote label', { maxLength: 80 })}
          <div className="form-columns">
            <div className="form-field"><label htmlFor="flight-tripType">Trip type</label><select id="flight-tripType" name="tripType" value={fields.tripType} disabled={locked} onChange={event => change('tripType', event.target.value)} aria-invalid={errors.tripType ? true : undefined} aria-describedby={errors.tripType ? 'flight-tripType-error' : undefined}><option value="one-way">One-way</option><option value="round-trip">Round-trip</option></select>{errors.tripType && <p className="field-error" id="flight-tripType-error">{errors.tripType}</p>}</div>
            <div className="form-field"><label htmlFor="flight-currency">Currency</label><select id="flight-currency" name="currency" value={fields.currency} disabled={locked} onChange={event => change('currency', event.target.value)} aria-invalid={errors.currency ? true : undefined} aria-describedby={errors.currency ? 'flight-currency-error' : undefined}><option value="USD">USD — US dollars</option><option value="EUR">EUR — euros</option></select>{errors.currency && <p className="field-error" id="flight-currency-error">{errors.currency}</p>}</div>
            {textField('origin', 'Departure airport', { maxLength: 3, hint: 'Three-letter airport code, for example MSY.', locked })}
            {textField('destination', 'Arrival airport', { maxLength: 3, hint: 'Three-letter airport code, for example JFK.', locked })}
            {textField('departureDate', 'Departure date', { type: 'date', locked })}
            {fields.tripType === 'round-trip' && textField('returnDate', 'Return date', { type: 'date', locked, hint: 'Required for round-trip quotes; on or after departure.' })}
            {textField('price', 'Total price per traveler, including fees', { inputMode: 'decimal', hint: `Amount in ${fields.currency} for the entire quote, including both directions for a round trip.` })}
            {textField('durationMinutes', 'Total journey duration (minutes)', { type: 'number', min: '1', max: '10080', step: '1', hint: 'Whole minutes for the entire quote. Add both directions for a round trip.' })}
            {textField('stops', 'Total stops', { type: 'number', min: '0', max: '10', step: '1', hint: 'Whole number, 0–10, across the entire quote; add both directions for a round trip.' })}
          </div>
          <button type="submit" className="page-button">Add quote to comparison</button>
        </form>
      </section>
      <div className="page-status" role="status" aria-live="polite">{status && <p>{status}</p>}</div>
      <h2 className="stable-heading" tabIndex={-1} ref={headingRef}>Your comparison ({quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'})</h2>
      {quotes.length === 0 ? <p>No quotes added yet. Enter a quote above to start comparing.</p> : <>
        <div className="comparison-controls"><label htmlFor="flight-sort">Sort quotes by</label><select id="flight-sort" value={sort} onChange={event => { setSort(event.target.value as FlightSort); setStatus(`Quotes sorted by ${event.target.value === 'price' ? 'lowest price' : 'shortest duration'}.`) }}><option value="price">Lowest price</option><option value="duration">Shortest duration</option></select></div>
        <ul className="plan-grid">{sortedQuotes.map(quote => <li className="page-panel plan-card" key={quote.id}><h3>{quote.airline}</h3><p className="quote-price">{new Intl.NumberFormat('en-US', { style: 'currency', currency: quote.currency }).format(quote.priceMinor / 100)} <span>{quote.currency}</span></p><p className="field-hint">Total per traveler, including fees</p><dl className="compact-details"><div><dt>Route</dt><dd>{quote.origin} → {quote.destination}{quote.tripType === 'round-trip' ? ` → ${quote.origin}` : ''}</dd></div><div><dt>Trip type</dt><dd>{quote.tripType === 'round-trip' ? 'Round-trip' : 'One-way'}</dd></div><div><dt>Departure</dt><dd>{quote.departureDate}</dd></div>{quote.tripType === 'round-trip' && <div><dt>Return</dt><dd>{quote.returnDate}</dd></div>}<div><dt>Entire journey duration</dt><dd>{quote.durationMinutes} minutes</dd></div><div><dt>Total stops</dt><dd>{quote.stops}</dd></div></dl><button type="button" className="page-button secondary" aria-label={`Remove ${quote.airline} quote`} onClick={() => remove(quote)}>Remove quote</button></li>)}</ul>
      </>}
      <div className="reset-section"><button type="button" className="page-button secondary" onClick={() => setConfirmReset(true)}>Reset comparison</button>{confirmReset && <div className="confirm-panel" role="group" aria-label="Confirm resetting flight comparison"><p>Clear all comparison quotes and any details entered in the form? This cannot be undone.</p><div className="page-actions"><button className="page-button danger" type="button" onClick={reset}>Yes, clear comparison</button><button className="page-button secondary" type="button" onClick={() => { setConfirmReset(false); headingRef.current?.focus() }}>Keep comparison</button></div></div>}</div>
      <nav className="page-links" aria-label="Flight comparison options"><a href="#/itinerary">Back to itinerary</a><a href="#/preferences">Trip preferences</a></nav>
    </section>
  )
}
