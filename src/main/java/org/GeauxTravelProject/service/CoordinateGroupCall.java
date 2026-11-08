package org.GeauxTravelProject.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class CoordinateGroupCall {

    public Map<String, Object> gatherAllData(double lat, double lng) {
        Map<String, Object> collectedData = new HashMap<>();

        //Run all functions at the same time using the incoming lat/long
        collectedData.put("flights", FlightAPI.generateFlight("MSY", "OGG", "1", "2026-11-21", "2026-11-26"));//change back to 'findNearestAirport' when done testing
        collectedData.put("weather", WeatherQuery.getWeatherForecast(lat, lng));
        collectedData.put("places", PlacesQuery.PlaceRandomizer(lat, lng));

        return collectedData;
    }
}
