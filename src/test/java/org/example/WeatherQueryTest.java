package org.example;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;



public class WeatherQueryTest {
    @Test
    void testInvalidLatitude() {
        String result = WeatherQuery.getSevenDayForecast(100.0, -91.1871);

        assertEquals("Invalid coordinates.", result);
    }

    @Test 
    void testInvalidLongitude() {
        String result = WeatherQuery.getSevenDayForecast(30.4515, 200.0);

       assertEquals("Invalid coordinates.", result);
    }

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

    @Test
    void testInvalidLatitudeBelowMinimum() {
        String result = WeatherQuery.getSevenDayForecast(-100.0, -91.1871);

        assertEquals("Invalid coordinates.", result);
    }

    @Test
    void testInvalidLongitudeBelowMinimum () {
    String result = WeatherQuery.getSevenDayForecast(30.4515, -200.0);

    assertEquals("Invalid coordinates.", result);
    }
}
