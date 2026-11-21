package org.GeauxTravelProject.service;


import com.google.gson.JsonObject;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.GeauxTravelProject.service.CheapestFlightDates.findCheapest;
import static org.GeauxTravelProject.service.FlightAPI.findNearestAirport;

@Service
public class CoordinateGroupCall {

    public Map<String, Object> gatherAllData(double lat, double lng) {
        Map<String, Object> collectedData = new HashMap<>();

        //Run all functions at the same time using the incoming lat/long
        JsonObject data = FlightAPI.findNearestAirport(lat, lng);

        findCheapest(data).ifPresent(result -> {
            System.out.println("Depart: " + result.outboundDate());
            System.out.println("Return: " + result.returnDate());
            System.out.println("Price: $" + result.price());

            String outbound = String.valueOf(result.outboundDate());
            String returnDate = String.valueOf(result.returnDate());
            String price = String.valueOf(result.price());

            collectedData.put("flight", FlightAPI.generateFlight("MSY", outbound, returnDate));//departure needs to be given by the user
            collectedData.put("weather", WeatherQuery.getWeatherForecast(lat, lng)); //add param for outbound,return date
            collectedData.put("places", PlacesQuery.PlaceRandomizer(lat, lng)); //add param for outbound,return date

        });

        return collectedData;
    }

}