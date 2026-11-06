package org.GeauxTravelProject;

import org.GeauxTravelProject.service.DailyForecast;
import org.GeauxTravelProject.service.WeatherQuery;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DailyForecastTest {

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

    @Test
    void testZeroPrecipitation() {
        DailyForecast day = new DailyForecast(
            "2026-11-01", 75.0, 55.0, 0.0, "Clear sky"
        );

        assertEquals(0.0, day.getPrecipitation());
        assertEquals("Clear sky", day.getCondition());

    }

    @Test
    void testInvalidLatitude() {
        assertThrows(
            IllegalArgumentException.class,
            () -> WeatherQuery.getSevenDayForecastData(100, -91)
        );
    }

    @Test
    void testInvalidLongitude() {
        assertThrows(
            IllegalArgumentException.class,
            () -> WeatherQuery.getSevenDayForecastData(30,200)
        );
    }
    }