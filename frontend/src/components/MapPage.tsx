import { useEffect, useRef, useState } from 'react'
import mapboxgl, { type Map as MapboxMap, type MapMouseEvent, type Marker } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './MapPage.css'
import type { Destination } from '../tripDraft'
import DestinationSearch from './DestinationSearch'

type MapStatus = 'loading' | 'ready' | 'error' | 'unsupported'

const fallbackToken = 'pk.eyJ1IjoiY29vbHByaW5jZXNzcGluazM0NSIsImEiOiJjbXZ2ZTkycHIwMHdtMnlvaTd1ZmsydmJqIn0.GEWiIErAiP3ZcAm7RLK4Uw'

type MapPageProps = {
  destination: Destination | null
  onDestinationChange: (destination: Destination | null) => void
}

export default function MapPage({ destination, onDestinationChange }: MapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const token = import.meta.env.VITE_MAPBOX_TOKEN?.trim() || fallbackToken
  const [status, setStatus] = useState<MapStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

    let active = true
    let initialized = false
    let map: MapboxMap | undefined
    let loadingTimeout: number | undefined

    const showError = () => {
      if (initialized) return
      if (active) setStatus('error')
      window.clearTimeout(loadingTimeout)
    }
    const selectDestination = (event: MapMouseEvent) => {
      if (active) onDestinationChange({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
    }

    const initializationFrame = window.requestAnimationFrame(() => {
      if (!active) return

      try {
        if (!mapboxgl.supported()) {
          setStatus('unsupported')
          return
        }

        map = new mapboxgl.Map({
          accessToken: token,
          container,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-74.5, 40],
          zoom: 9,
          keyboard: true,
          cooperativeGestures: true,
        })
        mapRef.current = map

        map.getCanvas().setAttribute('aria-label', 'Interactive destination map')
        map.getCanvas().setAttribute('aria-describedby', 'destination-map-instructions')
        map.getCanvas().style.cursor = 'crosshair'
        map.addControl(new mapboxgl.NavigationControl(), 'top-right')

        map.on('error', showError)
        map.on('click', selectDestination)
        map.once('load', () => {
          initialized = true
          window.clearTimeout(loadingTimeout)
          if (active) setStatus('ready')
        })
        loadingTimeout = window.setTimeout(showError, 20000)
      } catch {
        showError()
      }
    })

    return () => {
      active = false
      window.cancelAnimationFrame(initializationFrame)
      window.clearTimeout(loadingTimeout)
      map?.off('error', showError)
      map?.off('click', selectDestination)
      markerRef.current?.remove()
      markerRef.current = null
      map?.remove()
      if (mapRef.current === map) mapRef.current = null
    }
  }, [attempt, onDestinationChange, token])

  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready') return
    if (!destination) {
      markerRef.current?.remove()
      markerRef.current = null
      return
    }
    const coordinates: [number, number] = [destination.longitude, destination.latitude]
    if (!markerRef.current) {
      const marker = new mapboxgl.Marker({ color: '#5d4272', draggable: true })
        .setLngLat(coordinates).addTo(map)
      marker.getElement().setAttribute('aria-hidden', 'true')
      marker.on('dragend', () => {
        const point = marker.getLngLat()
        onDestinationChange({ latitude: point.lat, longitude: point.lng })
      })
      markerRef.current = marker
      map.jumpTo({ center: coordinates })
    } else {
      markerRef.current.setLngLat(coordinates)
    }
  }, [destination, status, attempt, onDestinationChange])

  const unavailable = status === 'error' || status === 'unsupported'

  return (
    <section className="destination-map" aria-labelledby="destination-map-title">
      <div className="destination-map-heading">
        <h2 id="destination-map-title">Explore the map</h2>
        <p id="destination-map-instructions">
          Search for a destination, click the map, or drag the pin to adjust
          your spot. Choose Plan a trip here when you are ready.
          With the map focused, use the arrow keys to move and
          + or − to zoom, then choose Use map center. On a touchscreen, use
          two fingers to move the map and tap to choose a spot.
        </p>
      </div>

      <DestinationSearch
        key={attempt} token={token} disabled={status !== 'ready'}
        onSelect={point => {
          onDestinationChange(point)
          mapRef.current?.jumpTo({ center: [point.longitude, point.latitude], zoom: 11 })
        }}
      />

      <div className="destination-map-frame" aria-busy={status === 'loading'}>
        <div
          ref={mapContainerRef}
          className="destination-map-canvas"
          role="region"
          aria-label="Destination map"
          aria-describedby="destination-map-instructions"
          aria-hidden={status !== 'ready'}
          inert={status !== 'ready'}
        />

        {status !== 'ready' && (
          <div className="destination-map-overlay">
            <div className="destination-map-message" role="status">
              {status === 'loading' ? (
                <p>Loading the map…</p>
              ) : (
                <>
                  <h3>Map unavailable</h3>
                  <p>
                    {status === 'unsupported'
                      ? 'This browser cannot display the interactive map. Try another browser or enable hardware acceleration in your browser settings.'
                      : 'The map could not finish loading. Check your connection and try again.'}
                  </p>
                </>
              )}
              {unavailable && (
                <button
                  className="destination-map-retry"
                  type="button"
                  onClick={() => {
                    setStatus('loading')
                    setAttempt((value) => value + 1)
                  }}
                >
                  Try map again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="destination-map-selection">
        <p role="status">
          {destination ? (
            <>Selected destination: latitude {destination.latitude.toFixed(5)}, longitude {destination.longitude.toFixed(5)}.</>
          ) : 'Choose a spot on the map to start planning.'}
        </p>
        <div className="destination-map-actions">
          <button
            type="button"
            disabled={status !== 'ready'}
            onClick={() => {
              const center = mapRef.current?.getCenter()
              if (center) onDestinationChange({ latitude: center.lat, longitude: center.lng })
            }}
          >
            Use map center
          </button>
          {destination && (
            <>
              <a id="destination-map-confirm" href="#/preferences">Plan a trip here</a>
              <button type="button" onClick={() => onDestinationChange(null)}>Clear destination</button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
