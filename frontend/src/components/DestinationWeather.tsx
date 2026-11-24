import { useEffect, useState } from 'react'
import type { Destination } from '../tripDraft'
import WeatherForecast, { type DailyForecast } from './WeatherForecast'

type WeatherResult = {
    forecast: DailyForecast[]
    advice: Record<string, string>
}

type WeatherState = WeatherResult & {
    loading: boolean
    error: string
}

const emptyWeather: WeatherState = {
    forecast: [],
    advice: {},
    loading: false,
    error: '',
}

export default function DestinationWeather({
    destination,
}: {
    destination: Destination | null
}) {
    const [weather, setWeather] = useState<WeatherState>(emptyWeather)
    const [resolvedLocation, setResolvedLocation] = useState <{
    latitude: number
    longitude: number
    label: string
} | null>(null)

    useEffect(() => {
        if (!destination) {
            setWeather(emptyWeather)
            return
        }

        const { latitude, longitude } = destination
        const controller = new AbortController()

        setWeather({ ... emptyWeather, loading: true })

        async function loadForecast() {
            try {
                const query = new URLSearchParams({
                    latitude: String(latitude),
                    longitude: String(longitude),
                })

                const response = await fetch(
                    `/api/weather/forecast?${query}`,
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error('Weather service unavailable')
                }

                const result: WeatherResult = await response.json()

                if (!Array.isArray(result.forecast)) {
                    throw new Error('Invalid weather response')
                }

                if (!controller.signal.aborted) {
                    setWeather({
                        forecast: result.forecast,
                        advice: result.advice ?? {},
                        loading: false,
                        error: '',
                    })
                }

            } catch {
                if (!controller.signal.aborted) {
                    setWeather({
                        ...emptyWeather,
                        error: 'Unable to load the forecast. Check that the Java backend is running. ',
                    })
                }
            }
        }
        void loadForecast()

        return () => controller.abort()
    }, [destination?.latitude, destination?.longitude])

    useEffect(() => {
        if (!destination || destination.label?.trim()) {
            return
        }
        const { latitude, longitude } = destination
        const controller = new AbortController()

        async function getLocationName() {
            try {
                const url = new URL('https://photon.komoot.io/reverse')

                url.searchParams.set('lat', String(latitude))
                url.searchParams.set('lon', String(longitude))
                url.searchParams.set('limit', '1')


                const response = await fetch(url.toString(), {
                    signal: controller.signal
                })

                if (!response.ok) return

                const data = await response.json()

                type PhotonFeature = {
                    properties: {
                        city?: string
                        town?: string
                        village?: string
                        name?: string
                        state?: string
                        country?: string
                    }
                }

                const features: PhotonFeature[] = Array.isArray(data.features)
                ? data.features
                : []

                const match = features.find((feature) => {
                    const p = feature.properties

                    return Boolean(
                        p?.city ||
                        p?.town ||
                        p?.village ||
                        p?.name
                    )
                })

                if (!match) return

                const properties = match.properties

                const placeName =
                properties.city ||
                properties.town ||
                properties.village ||
                properties.name

                const region =
                properties.state ||
                properties.country

                if (placeName && !controller.signal.aborted) {
                    setResolvedLocation({
                        latitude,
                        longitude,
                        label: `Near ${[placeName, region]
                            .filter(Boolean)
                            .join(', ')}`

                    })
                }
            } catch {

            }
        }

        void getLocationName()

        return () => controller.abort()
    }, [
        destination?.latitude,
        destination?.longitude,
        destination?.label
    ])


    if (!destination) return null

    return (
        <div className="home-weather">
            <p className="home-weather-location">
                Forecast for {' '}
                {destination.label?.trim() ||
                ( resolvedLocation?. latitude === destination.latitude &&
                    resolvedLocation?.longitude === destination.longitude
                    ? resolvedLocation.label
                    : `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`
                )}
            </p>

        <WeatherForecast
        forecast={weather.forecast}
        advice={weather.advice}
        loading={weather.loading}
        error={weather.error}
        />
        </div>
    )
}