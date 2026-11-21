package org.GeauxTravelProject.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class CoordinateGroupCall {

    public Map<String, Object> gatherAllData(double lat, double lng) {
        Map<String, Object> collectedData = new HashMap<>();

        //Run all functions at the same time using the incoming lat/long
        collectedData.put("flights", FlightAPI.findNearestAirport(lat, lng));
        collectedData.put("weather", WeatherQuery.getWeatherForecast(lat, lng));
        collectedData.put("places", PlacesQuery.PlaceRandomizer(lat, lng));

        return collectedData;
    }
}
