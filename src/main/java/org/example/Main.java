package org.example;
import com.google.gson.*;
import serpapi.*;

//import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

//import static org.junit.Assert.*;
public class Main {

    public static void main(String[] args) throws SerpApiException {
        System.out.println("starting main");
        generateFlight("MSY", "OGG", "1", "2026-10-21", "2026-10-26");
    }

    public static String generateFlight(String destination_airport, String departure_airport, String type, String outbound_date, String return_date) throws SerpApiException{
        destination_airport = destination_airport.toUpperCase();
        departure_airport = departure_airport.toUpperCase();
        type = type;
        outbound_date = outbound_date;
        return_date = return_date;


        Map<String, String> auth = new HashMap<>();
        auth.put("api_key", "api key");

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

        JsonArray otherFlights = data.getAsJsonArray("other_flights");
        JsonArray flights = (bestFlights != null && !bestFlights.isEmpty()) ? bestFlights : otherFlights;

        //GOOD - this returns the FIRST flight: info
        JsonObject firstFlight = flights.get(0).getAsJsonObject();

        ///


        //This puts us at the flights array
        JsonArray nested_firstFlights = firstFlight.getAsJsonArray("flights");





        //This puts us IN the flights array
        JsonObject nested_nested_firstFlights = nested_firstFlights.get(0).getAsJsonObject();

        //This puts us IN the departure airport field
        JsonObject leave_airport = nested_nested_firstFlights.getAsJsonObject("departure_airport");
        String leave_airportName = leave_airport.has("name") ? leave_airport.get("name").getAsString() : "N/A";
        String leave_airportCode = leave_airport.has("id") ? leave_airport.get("id").getAsString() : "N/A";
        String leave_departureTime = leave_airport.has("time") ? leave_airport.get("time").getAsString() : "N/A";

        //This puts us In the arrival airport field
        JsonObject arrive_airport = nested_nested_firstFlights.getAsJsonObject("arrival_airport");
        String arrive_airportName = arrive_airport.has("name") ? arrive_airport.get("name").getAsString() : "N/A";
        String arrive_airportCode = arrive_airport.has("id") ? arrive_airport.get("id").getAsString() : "N/A";
        String arrive_departureTime = arrive_airport.has("time") ? arrive_airport.get("time").getAsString() : "N/A";

        Integer duration = nested_nested_firstFlights.has("duration") ? nested_nested_firstFlights.get("duration").getAsInt() : 0;
        String airline = nested_nested_firstFlights.has("airline") ? nested_nested_firstFlights.get("airline").getAsString() : "N/A";
        String travel_class = nested_nested_firstFlights.has("travel_class") ? nested_nested_firstFlights.get("travel_class").getAsString() : "N/A";
        String flight_number = nested_nested_firstFlights.has("flight_number") ? nested_nested_firstFlights.get("flight_number").getAsString() : "N/A";
        Boolean flight_overnight = nested_nested_firstFlights.has("flight_number") ? nested_nested_firstFlights.get("flight_number").getAsBoolean() : false;
        Integer price = nested_nested_firstFlights.has("price") ? nested_nested_firstFlights.get("price").getAsInt() : 0;


        //This puts us IN the layover array
        JsonObject layovers = nested_firstFlights.get(1).getAsJsonObject();
        Integer layover_duration = layovers.has("duration") ? layovers.get("duration").getAsInt() : 0;
        String layover_name = layovers.has("name") ? layovers.get("name").getAsString() : "N/A";
        String layover_id = layovers.has("id") ? layovers.get("id").getAsString() : "N/A";
        Boolean layover_overnight = nested_nested_firstFlights.has("overnight") ? layovers.get("overnight").getAsBoolean() : false;


        System.out.println("departure airport"+ leave_airportName+ leave_airportCode+ leave_departureTime+
                "\narrival airport"+arrive_airportName+ arrive_airportCode+ arrive_departureTime+
                "\n duration"+ duration+ "airline"+ airline+ "travel class end\n");

        //JsonArray firstFlight2 = firstFlight.get("departure_airport").getAsJsonArray();

        //String name = firstFlight2.get("name").getAsString();

        //System.out.println("name: " + name);

        //firstFlight. ("arrival_time");
        ////JsonArray departure = firstFlight.get("departure_airport").getAsJsonArray();
        //String airline_name = departure.get(1).getAsString();

        //String leave = firstFlight.get("departure_airport").getAsString();


//        JsonObject departureAirport = firstFlight.getAsJsonObject("departure_airport");
//
//        // 4. Step 3: Call the internal keys inside the departure object safely
//        String airportName = departureAirport.has("name") ? departureAirport.get("name").getAsString() : "N/A";
//        String airportId   = departureAirport.has("id")   ? departureAirport.get("id").getAsString()   : "N/A";
//        String departureTime = departureAirport.has("time") ? departureAirport.get("time").getAsString() : "N/A";
//
//        // Print the extracted values
//        System.out.println("Airport Name: " + airportName);
//        System.out.println("Airport Code: " + airportId);
//        System.out.println("Departure Time: " + departureTime);
//
//        // 2. Extract the second JSON object (Index 1) from the array
//        //JsonObject jsonObject = jsonArray.get(1).getAsJsonObject();
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        System.out.println(gson.toJson(bestFlights));
        //System.out.println(gson.toJson(firstFlight2));



        //JsonObject leave_airport = flights.getAsJsonObject();


//        for (JsonElement flightElement : flights) {
//            if (flightElement.isJsonNull()) {System.out.println( "flight element is empty");}
//
//            JsonObject flight = flightElement.getAsJsonObject();
//
//
//            JsonArray leave_airport = flight.get("departure_airport").getAsJsonArray();
//            String name = leave_airport.get("name").getAsString();
//
//            System.out.println("Departure airport name : " + name);
//
//
//
//            // Extracts the price of the flights and prints it
//
//        }




        return "test";
    }

    public static String flightSearch(JsonArray firstFlight) throws SerpApiException{

        JsonArray FLIGHTS = firstFlight.getAsJsonArray();


        return "test";
    }

}



