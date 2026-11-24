package org.GeauxTravelProject.controller;

import org.GeauxTravelProject.service.DailyForecast;
import org.GeauxTravelProject.service.WeatherAdviceService;
import org.GeauxTravelProject.service.WeatherQuery;
import org.apache.catalina.connector.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherAdviceService adviceService;

    public WeatherController(WeatherAdviceService adviceService) {
        this.adviceService = adviceService;

    }

    @GetMapping("/forecast")
    public ResponseEntity<?> getForecast (
        @RequestParam double latitude,
        @RequestParam double longitude) {

            if (!Double.isFinite(latitude)
            || !Double.isFinite(longitude)
            || latitude < -90 || latitude > 90
            || longitude < -180 || longitude > 180) {

                return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid destination coordinates. ")
                );
            }

            try {
                List<DailyForecast> forecast =
                WeatherQuery.getSevenDayForecastData(latitude, longitude);

                return ResponseEntity.ok(
                    Map.of( "forecast", forecast, "advice", adviceService.getSevenDayAdvice(forecast)
                )
            );

        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
            .body(
                Map.of(
                    "message",
                    "The weather forecast is temporarily unavailable."
                )
            );
            }
        }


}
