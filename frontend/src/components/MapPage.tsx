import { useEffect, useRef, useState } from 'react'
import mapboxgl, { type Map as MapboxMap } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './MapPage.css'

type MapStatus = 'loading' | 'ready' | 'error' | 'unsupported'

const fallbackToken = 'pk.eyJ1IjoiY29vbHByaW5jZXNzcGluazM0NSIsImEiOiJjbXZ2ZTkycHIwMHdtMnlvaTd1ZmsydmJqIn0.GEWiIErAiP3ZcAm7RLK4Uw'

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
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

    const initializationFrame = window.requestAnimationFrame(() => {
      if (!active) return

      try {
        if (!mapboxgl.supported()) {
          setStatus('unsupported')
          return
        }

        map = new mapboxgl.Map({
          accessToken: import.meta.env.VITE_MAPBOX_TOKEN?.trim() || fallbackToken,
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
        map.addControl(new mapboxgl.NavigationControl(), 'top-right')

        map.on('error', showError)
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
      map?.remove()
      if (mapRef.current === map) mapRef.current = null
    }
  }, [attempt])

  const unavailable = status === 'error' || status === 'unsupported'

  return (
    <section className="destination-map" aria-labelledby="destination-map-title">
      <div className="destination-map-heading">
        <h2 id="destination-map-title">Explore the map</h2>
        <p id="destination-map-instructions">
          Drag to explore or use the zoom controls. With the map focused, use
          the arrow keys to move and + or − to zoom. On a touchscreen, use two
          fingers to move the map.
        </p>
      </div>

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
    </section>
  )
}
