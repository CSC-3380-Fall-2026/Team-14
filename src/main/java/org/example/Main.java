package org.example;
import com.google.gson.JsonElement;
import serpapi.*;

import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
//import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

//import static org.junit.Assert.*;
public class Main {

    public static void main(String[] args) throws SerpApiException {
        generateFlight("MSY", "OGG", "1", "2026-10-21", "2026-10-26");
    }

    public static String generateFlight(String destination_airport, String departure_airport, String type, String outbound_date, String return_date) throws SerpApiException{
        destination_airport = destination_airport.toUpperCase();
        departure_airport = departure_airport.toUpperCase();
        type = type;
        outbound_date = outbound_date;
        return_date = return_date;


        Map<String, String> auth = new HashMap<>();
        auth.put("api_key", "d5db28d49bc0c7135cba2bd2f203331ece06af7374d89f5aefd0897e56c05d6a");

        SerpApi client = new SerpApi(auth);

        Map<String, String> params = new HashMap<>();
        params.put("engine", "google_flights");
        params.put("q", "Baton Rouge to Denver");
        params.put("departure_id", destination_airport);
        params.put("arrival_id", departure_airport);
        params.put("type", type);
        params.put("outbound_date", outbound_date);
        params.put("return_date", return_date);



        JsonObject data = client.search(params);
        JsonArray bestFlights = data.getAsJsonArray("best_flights");

        for (JsonElement flightElement : bestFlights) {
            JsonObject flight = flightElement.getAsJsonObject();

            // Extracts the price of the flights and prints it
            if (flight.has("price")) {
                int price = flight.get("price").getAsInt();
                System.out.println("Price: $" + price);
            }
        }

        return "test";
    }

}

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or


