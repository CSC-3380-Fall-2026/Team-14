import { useEffect, useRef, useState } from 'react'
import { Map as MapLibreMap, NavigationControl, Marker, type MapMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './MapPage.css'
import type { Destination } from '../tripDraft'
import DestinationSearch from './DestinationSearch'
import { createMapReadiness } from '../mapReadiness'

type MapStatus = 'loading' | 'ready' | 'error'

type MapPageProps = {
  destination: Destination | null
  onDestinationChange: (destination: Destination | null) => void
}

export default function MapPage({ destination, onDestinationChange }: MapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [status, setStatus] = useState<MapStatus>('loading')
  const [attempt, setAttempt] = useState(0)
  const planRequest = useRef<AbortController | null>(null)
  const [planStatus, setPlanStatus] = useState<{ destination: Destination; state: 'sending' | 'failed' } | null>(null)

  useEffect(() => () => {
    planRequest.current?.abort()
    planRequest.current = null
  }, [destination])

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

    let active = true
    let map: MapLibreMap | undefined
    let loadingTimeout: number | undefined

    const readiness = createMapReadiness(state => {
      if (active) setStatus(state)
      if (state === 'ready') window.clearTimeout(loadingTimeout)
    })
    const showError = () => readiness.failed()
    const settleMap = () => {
      window.clearTimeout(loadingTimeout)
      readiness.loaded()
    }
    const selectDestination = (event: MapMouseEvent) => {
      if (active) onDestinationChange({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
    }

    const initializationFrame = window.requestAnimationFrame(() => {
      if (!active) return

      try {
        map = new MapLibreMap({
          container,
          style: {
            version: 8,
            sources: {
              openstreetmap: {
                type: 'raster',
                tiles: [import.meta.env.VITE_MAP_TILE_URL?.trim() || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 19,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              },
            },
            layers: [{ id: 'openstreetmap', type: 'raster', source: 'openstreetmap' }],
          },
          attributionControl: false,
          maxZoom: 19,
          center: [-74.5, 40],
          zoom: 9,
          keyboard: true,
          cooperativeGestures: true,
        })
        mapRef.current = map

        map.getCanvas().setAttribute('aria-label', 'Interactive destination map')
        map.getCanvas().setAttribute('aria-describedby', 'destination-map-instructions')
        map.getCanvas().style.cursor = 'crosshair'
        map.addControl(new NavigationControl(), 'top-right')

        map.on('error', showError)
        map.on('click', selectDestination)
        map.on('sourcedata', readiness.sourceData)
        map.once('load', settleMap)
        loadingTimeout = window.setTimeout(settleMap, 20000)
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
      map?.off('sourcedata', readiness.sourceData)
      map?.off('load', settleMap)
      markerRef.current?.remove()
      markerRef.current = null
      map?.remove()
      if (mapRef.current === map) mapRef.current = null
    }
  }, [attempt, onDestinationChange])

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
      const marker = new Marker({ color: '#5d4272', draggable: true })
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

  const canRetryMap = status === 'error'
  const currentPlanStatus = planStatus?.destination === destination ? planStatus.state : null

  async function handlePlanTrip() {
    if (!destination || planRequest.current) return
    const request = new AbortController()
    planRequest.current = request
    setPlanStatus({ destination, state: 'sending' })
    const timeout = window.setTimeout(() => request.abort(), 10000)

    try {
      const response = await fetch('/api/itinerary/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: destination.latitude, longitude: destination.longitude }),
        signal: request.signal,
      })
      if (!response.ok) throw new Error('Trip lookup failed')
      await response.json()
      if (planRequest.current === request) {
        setPlanStatus(null)
        window.location.hash = '#/preferences'
      }
    } catch {
      if (planRequest.current === request) setPlanStatus({ destination, state: 'failed' })
    } finally {
      window.clearTimeout(timeout)
      if (planRequest.current === request) planRequest.current = null
    }
  }

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
        disabled={false}
        onSelect={point => {
          onDestinationChange(point)
          if (status === 'ready') {
            mapRef.current?.jumpTo({ center: [point.longitude, point.latitude], zoom: 11 })
          }
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
              {status === 'loading' && <p>Loading the map…</p>}
              {status === 'error' && (
                <>
                  <h3>Map unavailable</h3>
                  <p>
                    The map could not finish loading. Check your connection and try again, or search above to select a destination.
                  </p>
                </>
              )}
              {canRetryMap && (
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
      <p className="destination-map-attribution">
        Map and search data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.
        {' '}Search by <a href="https://photon.komoot.io/">Photon</a>.
        {' '}<a href="https://www.openstreetmap.org/fixthemap">Report a map issue</a>
      </p>
      <div className="destination-map-selection">
        <p role="status">
          {destination ? (
            <>Selected destination: {destination.label ?? 'Dropped pin'} ({destination.latitude.toFixed(5)}, {destination.longitude.toFixed(5)}).</>
          ) : 'Search for a destination or choose a spot on the map.'}
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
              <button
                type="button"
                id="destination-map-confirm"
                disabled={currentPlanStatus === 'sending'}
                onClick={handlePlanTrip}
              >
                {currentPlanStatus === 'sending' ? 'Creating trip...' : 'Plan a trip here'}
              </button>
              <button type="button" onClick={() => onDestinationChange(null)}>Clear destination</button>
            </>
          )}
        </div>
        {currentPlanStatus === 'failed' && (
          <p role="status">Trip details are unavailable right now. <a href="#/preferences">Continue to trip preferences</a></p>
        )}
      </div>
    </section>
  )
}
