package org.example;
import com.google.gson.*;
import serpapi.*;
import java.util.HashMap;
import java.util.Map;

//import static org.junit.Assert.*;
public class Main {

    public static void main(String[] args) throws SerpApiException {
        //calls generateFlight with the info from user
        Map<String, FlightQueury> all_flight_data = generateFlight("MSY", "OGG", "1", "2026-10-21", "2026-10-26");

    }

    /**
     * Generates about 3-4 separate flight info using the given parameters. It loops through all the different flight
     * objects saves it to a reference of 'FlightQueury', which is then stored in a map. Must use a key to access
     * the separate instances inside the map which can then be used like a normal instance.
     *
     * @param destination_airport, departure_airport, type, outbound_date, return_date
     * @return all_flight_data
     * @throwsSerpApiException
     */
    public static Map<String, FlightQueury> generateFlight(String destination_airport, String departure_airport, String type, String outbound_date, String return_date) throws SerpApiException{
        destination_airport = destination_airport.toUpperCase();
        departure_airport = departure_airport.toUpperCase();

        Map<String, FlightQueury> all_flight_data = new HashMap<>();

        //API stuff - feeding it the parameters
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

        //chooses Array best_flights unless empty, then chooses Array other_flights
        JsonArray flights = (bestFlights != null && !bestFlights.isEmpty()) ? bestFlights : otherFlights;

        int count_flights = flights.size();

        //continually loops through every generated flight data from the API and saves it to an instance of FlightQueury
        //If the value retrieved is null then it fills it with placeholders
        for (int i = 0; i < count_flights; i++) {

            //GOOD - this returns the FIRST flight: info
            JsonObject firstFlight = flights.get(i).getAsJsonObject();

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
            Boolean flight_overnight = nested_nested_firstFlights.has("overnight") ? nested_nested_firstFlights.get("overnight").getAsBoolean() : false;
            Integer price = nested_nested_firstFlights.has("price") ? nested_nested_firstFlights.get("price").getAsInt() : 0;

            Integer layover_duration = 0;
            String layover_name = "";
            String layover_id = "";
            Boolean layover_overnight = false;


            //This puts us IN the layover array
            if (!nested_firstFlights.isJsonNull()) {
                JsonObject layovers = nested_firstFlights.get(1).getAsJsonObject();
                layover_duration = layovers.has("duration") ? layovers.get("duration").getAsInt() : 0;
                layover_name = layovers.has("name") ? layovers.get("name").getAsString() : "N/A";
                layover_id = layovers.has("id") ? layovers.get("id").getAsString() : "N/A";
                layover_overnight = nested_nested_firstFlights.has("overnight") ? layovers.get("overnight").getAsBoolean() : false;
            }



            //test - use this to check if the data retrieved is right
            //System.out.println("departure airport "+ leave_airportName + leave_airportCode+ leave_departureTime +
            //        "\n arrival airport"+arrive_airportName+ arrive_airportCode+ arrive_departureTime+
            //        "\n duration "+ duration+ " airline "+ airline+ " travel class -end\n");

            //test - use this to print the original nested JSON elements given by the AI
            //Gson gson = new GsonBuilder().setPrettyPrinting().create();
            //System.out.println(gson.toJson(bestFlights));

            FlightQueury temp_flight_data = new FlightQueury
                    ( leave_airportName, leave_airportCode, leave_departureTime, arrive_airportName,
                            arrive_airportCode, arrive_departureTime, duration, airline, travel_class, flight_number, flight_overnight, price,
                            layover_duration, layover_name, layover_id, layover_overnight);


            //Create a dynamic "name" string for this specific instance
            String dynamicReferenceName = "flight_data_" + i;

            all_flight_data.put(dynamicReferenceName, temp_flight_data);
        }
        //gets the info for the flights; should make into a for loop when implementing to website
        FlightQueury flight_data_1 = all_flight_data.get("flight_data_1");
        System.out.print ("layover name: "+ flight_data_1.layover_name + " price: " + flight_data_1.price);

        return all_flight_data;
    }


}



