package org.GeauxTravelProject;

import org.GeauxTravelProject.service.DailyForecast;
import org.GeauxTravelProject.service.WeatherAdviceService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class WeatherAdviceServiceTest {

    private final WeatherAdviceService service =
        new WeatherAdviceService();

    @Test
    void testThunderstormAdvice() {
        DailyForecast day = new DailyForecast("2026-11-21", 85, 70, 1.5, "Thunderstorm");

        assertTrue(service.getWeatherAdvice(day)
        .contains("Avoid outdoor"));
    }
    @Test
    void testRainAdvice() {
        DailyForecast day = new DailyForecast(
                "2026-11-21", 75, 60, 0.8, "Heavy rain");

        assertTrue(service.getWeatherAdvice(day)
                .contains("indoor activities"));
    }

    @Test
    void testClearWeatherAdvice() {
        DailyForecast day = new DailyForecast(
                "2026-11-21", 78, 65, 0, "Clear sky");

        assertTrue(service.getWeatherAdvice(day)
                .contains("outdoor sightseeing"));
    }

    @Test
    void testHotWeatherAdvice() {
        DailyForecast day = new DailyForecast(
                "2026-11-21", 100, 80, 0, "Clear sky");

        assertTrue(service.getWeatherAdvice(day)
                .contains("Stay hydrated"));
    }

    @Test
    void testFreezingWeatherAdvice() {
        DailyForecast day = new DailyForecast(
                "2026-11-21", 35, 25, 0, "Clear sky");

        assertTrue(service.getWeatherAdvice(day)
                .contains("Dress warmly"));
    }

    @Test
    void testCloudyWeatherAdvice() {
        DailyForecast day = new DailyForecast(
                "2026-11-21", 70, 55, 0, "Overcast");

        assertTrue(service.getWeatherAdvice(day)
                .contains("Cloudy weather"));
    }

    @Test
    void testNullForecast() {
        assertTrue(service.getWeatherAdvice(null)
                .contains("unavailable"));
    }

    @Test
    void testSevenDayAdvice() {
        List<DailyForecast> forecast = List.of(
            new DailyForecast("2026-11-21", 78, 65, 0, "Clear sky"),
            new DailyForecast("2026-11-22", 75, 60, 1, "Heavy rain"),
            new DailyForecast("2026-11-23", 72, 58, 0, "Overcast"),
            new DailyForecast("2026-11-24", 85, 70, 1, "Thunderstorm"),
            new DailyForecast("2026-11-25", 100, 80, 0, "Clear sky"),
            new DailyForecast("2026-11-26", 35, 25, 0, "Clear sky"),
            new DailyForecast("2026-11-27", 76, 60, 0, "Partly cloudy")
        );

        Map<String, String> advice =
                service.getSevenDayAdvice(forecast);

        assertEquals(7, advice.size());

        assertTrue(advice.get("2026-11-21")
                .contains("outdoor sightseeing"));

        assertTrue(advice.get("2026-11-22")
                .contains("indoor activities"));
    }
}


