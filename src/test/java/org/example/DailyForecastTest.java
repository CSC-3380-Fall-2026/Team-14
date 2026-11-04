package org.example;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
/**
 * Tests the DailyForecast class and verifies that the
 * structured weather forecast rejects invalid coordinates
 */
public class DailyForecastTest {

    /**
     * Verifies that the DailyForecast constructor correctly stores
     * the date, high and low temperatures, precipitation,
     * and weather conditions.
     */
    @Test
    void testDailyForecastValues() {
        DailyForecast day = new DailyForecast(
            "2026-10-31", 80.5, 62.3, 0.25, "Cloudy"
        );

        assertEquals("2026-10-31", day.getDate());
        assertEquals(80.5, day.getHighTemperature());
        assertEquals(62.3, day.getLowTemperature());
        assertEquals(0.25, day.getPrecipitation());
        assertEquals("Cloudy", day.getCondition());


    }


    /**
     * Verifies that DailyForecast correctly stores zero precipitation
     * and returns the expected weather condition.
     */
    @Test
    void testZeroPrecipitation() {
        DailyForecast day = new DailyForecast(
            "2026-11-01", 75.0, 55.0, 0.0, "Clear sky"
        );

        assertEquals(0.0, day.getPrecipitation());
        assertEquals("Clear sky", day.getCondition());

    }

    /**
     * Verifies that the structured forecast method rejects
     * latitude values outside the valid range of -90 to 90 degrees.
     */
    @Test
    void testInvalidLatitude() {
        assertThrows(
            IllegalArgumentException.class,
            () -> WeatherQuery.getSevenDayForecastData(100, -91)
        );
    }

    /**
     * Verifies that the structured forecast method rejects
     * longitude values outside the valid range of -180 to 180 degrees.
     */
    @Test
    void testInvalidLongitude() {
        assertThrows(
            IllegalArgumentException.class,
            () -> WeatherQuery.getSevenDayForecastData(30,200)
        );
    }
    }