import { useEffect, useRef, useState, type FormEvent } from 'react'
import { searchDestinations, type DestinationSearchResult } from '../destinationSearch'
import type { Destination } from '../tripDraft'

type DestinationSearchProps = {
  token: string
  disabled: boolean
  onSelect: (destination: Destination) => void
}

export default function DestinationSearch({ token, disabled, onSelect }: DestinationSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DestinationSearchResult[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const requestRef = useRef<AbortController | null>(null)
  const focusConfirmation = useRef(false)

  function cancelRequest() {
    requestRef.current?.abort()
    requestRef.current = null
  }

  useEffect(() => () => {
    requestRef.current?.abort()
    requestRef.current = null
  }, [])

  useEffect(() => {
    if (focusConfirmation.current) {
      document.getElementById('destination-map-confirm')?.focus()
      focusConfirmation.current = false
    }
  })

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled) return
    cancelRequest()
    const request = new AbortController()
    requestRef.current = request
    setLoading(true)
    setResults([])
    setMessage('Searching…')
    const timeout = window.setTimeout(() => request.abort(), 12000)
    try {
      const matches = await searchDestinations(query, token, request.signal)
      if (requestRef.current !== request) return
      setResults(matches)
      setMessage(matches.length ? 'Choose a result to place the pin.' : 'No places found. Try another city, region, or address.')
    } catch (error) {
      if (requestRef.current !== request) return
      setMessage(request.signal.aborted
        ? 'Search took too long. Try again or choose a spot on the map.'
        : error instanceof TypeError
          ? 'Search could not connect. Check your connection or choose a spot on the map.'
          : error instanceof Error ? error.message : 'Search could not finish. Please try again.')
    } finally {
      window.clearTimeout(timeout)
      if (requestRef.current === request) {
        requestRef.current = null
        setLoading(false)
      }
    }
  }

  return (
    <div className="destination-search">
      <form onSubmit={search} noValidate role="search" aria-label="Find a destination">
        <label htmlFor="destination-search-query">Search for a destination</label>
        <div className="destination-search-fields">
          <input
            id="destination-search-query" name="destination" type="search"
            value={query} maxLength={200} disabled={disabled} autoComplete="off"
            placeholder="City, region, or address"
            onChange={event => {
              cancelRequest()
              setQuery(event.target.value)
              setLoading(false)
              setResults([])
              setMessage('')
            }}
          />
          <button type="submit" disabled={disabled || loading}>{loading ? 'Searching…' : 'Search'}</button>
        </div>
      </form>
      <p className="destination-search-status" role="status">{message}</p>
      {results.length > 0 && (
        <ul className="destination-search-results" aria-label="Destination search results">
          {results.map((result, index) => (
            <li key={`${result.id}-${index}`}>
              <button type="button" disabled={disabled} onClick={() => {
                focusConfirmation.current = true
                onSelect(result.destination)
                setResults([])
                setMessage('')
              }}>{result.label}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
