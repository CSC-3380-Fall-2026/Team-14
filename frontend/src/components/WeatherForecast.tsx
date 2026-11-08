import './WeatherForecast.css'

/**
 * Represents the weather forecast for one day.
 * 
 */
export interface DailyForecast {
    date: string
    highTemperature: number
    lowTemperature: number
    precipitation: number
    condition: string
}

interface WeatherForecastProps {
    forecast: DailyForecast[]
    loading?: boolean
    error?: string
}

/**
 * Displays a seven-day weather forecast, including
 * temperatures, precipitation, and weather conditions.
 */
export default function WeatherForecast({
    forecast,
    loading = false,
    error = ''
}: WeatherForecastProps) {
    return (
        <section className="weather-forecast" aria-labelledby="weather-title">
            <h2 id="weather-title">7-Day Weather Forecast</h2>

            {loading ? (
                <p role= "status">Loading weather forecast...</p>
            ) : error ? (
                <p role="alert">{error}</p>
            ) : forecast.length === 0 ? (
                <p>No weather forecast available.</p>
            ) : (
                <div className="forecast-grid">
                    {forecast.slice(0, 7).map((day) => (
                        <article className="forecast-card" key={day.date}>
                            <h3>{day.date}</h3>
                            <p className="weather-condition">{day.condition}</p>
                            <p>High: {day.highTemperature.toFixed(1)}°F</p>
                            <p>Low: {day.lowTemperature.toFixed(1)}°F</p>
                            <p>Precipitation: {day.precipitation.toFixed(2)} in</p>
                        </article>
                    ))}
                </div>
                
            )}
            </section>
   )
}