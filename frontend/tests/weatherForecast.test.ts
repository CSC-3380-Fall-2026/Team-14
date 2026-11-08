import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

/**
 * Creates a Vite server to load the React weather component
 * for automated testing.
 */
const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
})

after(async() => {
    await vite.close()
})

const { default: WeatherForecast } = await vite.ssrLoadModule(
    '/src/components/WeatherForecast.tsx'
)

/**
 * Creates seven days of sample weather information
 * for testing the forecast display.
 */

const sampleForecast = Array.from({ length: 7}, (_, i) => ({
    date: `2026-11-${String(i + 7).padStart(2,'0')}`,
    highTemperature: 78,
    lowTemperature: 60,
    precipitation: 0.25,
    condition: 'Partly cloudy'
}))

/**
 * Verifies that seven daily forecast cards are displayed.
 */
test('displays seven forecast cards', () => {
    const html = renderToStaticMarkup(
        createElement(WeatherForecast, { forecast: sampleForecast})
    )

    assert.equal((html.match(/class="forecast-card"/g) ?? []).length, 7)
})
/**
 * Verifies that the forecast displays the correct
 * temperatures, precipitation, and weather condition.
 */
test('displays weather information', () => {
    const html = renderToStaticMarkup(
        createElement(WeatherForecast, { forecast: sampleForecast })
    )

    assert.match(html, /High: 78.0°F/)
    assert.match(html, /Low: 60.0°F/)
    assert.match(html, /Precipitation: 0.25 in/)
    assert.match(html, /Partly cloudy/)
})
/**
 * Verifies that the loading message appears
 * when weather information is being retrieved.
 */
test('displays loading message', () => {
    const html = renderToStaticMarkup(
        createElement(WeatherForecast, {
            forecast: [],
            loading: true,
        })
    )

        assert.match(html, /Loading weather forecast/)
})
/**
 * Verifies that an error message is displayed
 * when weather information cannot be retrieved.
 */
test('displays error message', () => {
    const html = renderToStaticMarkup(
        createElement(WeatherForecast, {
            forecast: [],
            error: 'Weather service unavailable'
        })
    )
    
    assert.match(html, /Weather service unavailable/)
})
/**
 * Verifies that the component handles empty forecast data.
 */
test('handles empty forecast', () => {
    const html = renderToStaticMarkup(
        createElement(WeatherForecast, { forecast: [] })
    )

    assert.match(html, /No weather forecast available/)
})
/**
 * Verifies that the forecast displays no more
 * than seven days of weather information.
 */
test('limits the display to seven days', () => {
    const eightDays = [
        ...sampleForecast,
        { ...sampleForecast[0], date: '2026-11-14' },
    ]

    const html = renderToStaticMarkup(
        createElement(WeatherForecast, { forecast: eightDays })
    )

    assert.equal((html.match(/class="forecast-card"/g) ?? []).length, 7)
})