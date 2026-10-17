package org.example;

import java.util.Random;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser; 

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

            JsonObject search_result = 
                JsonParser.parseString(response.body()).getAsJsonObject();
            JsonArray places = search_result.getAsJsonArray("features");

            System.out.println("Places found: " + places.size());
    }
    
}
