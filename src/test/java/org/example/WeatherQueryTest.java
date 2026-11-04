package org.example;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests the seven-day weather forecast functionality in WeatherQuery.
 * Verifies coordinate validation and checks that the forecast
 * contains seven days of weather information.
 */
public class WeatherQueryTest {

    /**
     * Verifies that the seven-day forecast method rejects
     * latitude values greater than the maximum of 90 degrees.
     */
    @Test
    void testInvalidLatitude() {
        String result = WeatherQuery.getSevenDayForecast(100.0, -91.1871);

        assertEquals("Invalid coordinates.", result);
    }
    /**
     * Verifies that the seven-day forecast method rejects
     * longitude values greater than the maximum of 180 degrees.
     */
    @Test
    void testInvalidLongitude() {
        String result = WeatherQuery.getSevenDayForecast(30.4515, 200.0);

       assertEquals("Invalid coordinates.", result);
    }
    /**
     * Verifies that the seven-day forecast contains exactly seven days
     * of weather data, including high and low temperatures,
     * precipitation, and weather conditions.
     */
    @Test
    void testSevenDayForecast() {
        double latitude = 30.4515;
        double longitude = -91.1871;

        String forecast = WeatherQuery.getSevenDayForecast(latitude, longitude);

        long dayCount = forecast.lines()
        .filter(line -> line.startsWith("Date: "))
        .count();

        assertEquals(7, dayCount, "Forecast should contain exactly 7 days.");

        assertTrue(forecast.contains("High:"));
        assertTrue(forecast.contains("Low:"));
        assertTrue(forecast.contains("Precipitation:"));
        assertTrue(forecast.contains("Condition:"));
    }
    /**
     * Verifies that the seven-day forecast method rejects
     * latitude values less than the minimum of -90 degrees.
     */
    @Test
    void testInvalidLatitudeBelowMinimum() {
        String result = WeatherQuery.getSevenDayForecast(-100.0, -91.1871);

        assertEquals("Invalid coordinates.", result);
    }
    /**
     * Verifies that the seven-day forecast method rejects
     * longitude values less than the minimum of -180 degrees.
     */
    @Test
    void testInvalidLongitudeBelowMinimum () {
    String result = WeatherQuery.getSevenDayForecast(30.4515, -200.0);

    assertEquals("Invalid coordinates.", result);
    }
}
