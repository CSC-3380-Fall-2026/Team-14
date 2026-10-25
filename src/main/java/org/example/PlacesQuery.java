package org.example;

import java.util.Random;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser; 

// Resturant Finder 
public class PlacesQuery {
    public static void main(String[] args) throws Exception {
        String api_key = System.getenv("GEOAPIFY_API_KEY"); // checking if Java can read my API
        if (api_key == null || api_key.isBlank()) { // checks if empty
            System.out.println("Missing API key");
            return;
        } else {
            System.out.println("API key loaded");
        }
        double latitude = 30.4515;
        double longitude = -91.1871;
        
        String request_url = "https://api.geoapify.com/v2/places" // finds the places
            + "?categories=catering.restaurant" // finds the restaurant 
            + "&filter=circle:" + longitude + "," + latitude + ",5000" // searches around/within 5000 meters
            + "&limit=20" // up to 20 places 
            + "&apiKey=" + api_key; // reads the environment

        HttpClient client = HttpClient.newHttpClient(); // connecting my program to Geoapify

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(request_url))
            .GET() // ask Geoapify to retrieve the information
            .build();
        
            HttpResponse<String> response = client.send(
                request, HttpResponse.BodyHandlers.ofString()
            );   
            System.out.println("Status: " + response.statusCode());
            
            if (response.statusCode() !=200) {
                System.out.println("Places search failed.");
                return;
            }
            
            //Resturant generator 
            JsonObject search_result =  //reads my reply 
                JsonParser.parseString(response.body()).getAsJsonObject(); 
            JsonArray places = search_result.getAsJsonArray("features"); // gets the list of places 

            System.out.println("Places found: " + places.size()); // prints how mnay places were actually found

            if (places.size() == 0) {
                System.out.println("No returants found nearby."); // stops if nothing was found
                return;
            }

            // random number generator 
            Random random = new Random();
            int random_index = random.nextInt(places.size()); //picks between 0 & 20 

            JsonObject selected_place = 
                places.get(random_index).getAsJsonObject(); 

            JsonObject place_details = 
                selected_place.getAsJsonObject("properties"); //gets the name & address
            
            // Name Check 
            if (place_details.has("name")
                && !place_details.get("name").isJsonNull()) {
            String restaurant_name = place_details.get("name").getAsString();
                System.out.println("Restaurant: " + restaurant_name);
        } else { 
            System.out.println("Selected retaurant has no listed name.");
        }

        // Activity Finder
        String activity_url = "https://api.geoapify.com/v2/places" // finds the places
            + "?categories=tourism.attraction" // finds the activity
            + "&filter=circle:" + longitude + "," + latitude + ",5000" // searches around/within 5000 meters
            + "&limit=20" // up to 20 places 
            + "&apiKey=" + api_key; // reads the environment
            
        HttpRequest activity_request = HttpRequest.newBuilder()
            .uri(URI.create(activity_url))
            .GET() // ask Geoapify to retrieve the information
            .build();
        
        HttpResponse<String> activity_response = client.send(
            activity_request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Activity status: " + activity_response.statusCode());
            
            if (response.statusCode() !=200) {
                System.out.println("Activity search failed.");
                return;
            }
        //Activity generator 
        JsonObject activity_result =  //reads my reply 
            JsonParser.parseString(activity_response.body()).getAsJsonObject(); 
        JsonArray activities = activity_result.getAsJsonArray("features"); // gets the list of activites

        System.out.println("Activities found: " + activities.size()); // prints how many activities were actually found

        if (activities.size() == 0) { //empty lsits check
            System.out.println("No activites nearby."); // stops if nothing was found
            return;
        }
        // random number generator 
        int activity_index = random.nextInt(activities.size()); //picks between 0 & 9 

        JsonObject selected_activity = 
            activities.get(activity_index).getAsJsonObject(); 

        JsonObject activity_details = 
            selected_activity.getAsJsonObject("properties"); //gets the name & address
        
        // Name Check 
        if (activity_details.has("name")
            && !activity_details.get("name").isJsonNull()) {
        String activity_name = activity_details.get("name").getAsString();
            System.out.println("Activity: " + activity_name);
    } else { 
        System.out.println("Selected activity has no name.");
    }
        // Activity Finder
        String hotel_url = "https://api.geoapify.com/v2/places" // finds the places
            + "?categories=accommodation.hotel" // finds the activity
            + "&filter=circle:" + longitude + "," + latitude + ",5000" // searches around/within 5000 meters
            + "&limit=20" // up to 20 places 
            + "&apiKey=" + api_key; // reads the environment
    
        HttpRequest hotel_request = HttpRequest.newBuilder()
            .uri(URI.create(hotel_url))
            .GET() // ask Geoapify to retrieve the information
            .build();

        HttpResponse<String> hotel_response = client.send(
            hotel_request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Hotel status: " + hotel_response.statusCode());
    
        if (response.statusCode() !=200) {
            System.out.println("Hotel search failed.");
        return;
    }
        //Activity generator 
        JsonObject hotel_result =  //reads my reply 
            JsonParser.parseString(hotel_response.body()).getAsJsonObject(); 
        JsonArray hotels = hotel_result.getAsJsonArray("features"); // gets the list of activites

        System.out.println("Hotel found: " + hotels.size()); // prints how many activities were actually found

        if (hotels.size() == 0) { //empty lsits check
            System.out.println("No hotel nearby."); // stops if nothing was found
        return;
    }
        // random number generator 
        int hotel_index = random.nextInt(hotels.size()); //picks between 0 & 12

        JsonObject selected_hotel = 
            hotels.get(hotel_index).getAsJsonObject(); 

        JsonObject hotel_details = 
        selected_hotel.getAsJsonObject("properties"); //gets the name & address

        // Name Check 
        if (hotel_details.has("name")
            && !hotel_details.get("name").isJsonNull()) {
        String hotel_name = hotel_details.get("name").getAsString();
             System.out.println("Hotel: " + hotel_name);
    } else { 
        System.out.println("Selected hotel has no name.");
    }
        

    }
    
}
