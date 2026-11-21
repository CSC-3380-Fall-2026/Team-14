package org.GeauxTravelProject.service;

import java.io.IOException;
import java.util.Random;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.stereotype.Service;

// Restaurant Finder
// Randomized itinerary: restaurant, activity, and hotel
@Service
public class PlacesQuery {
    private static final String BASE_URL = "https://api.geoapify.com/v2/places"; // finds the places
    private static final int RADIUS_METERS = 5000; // searches around/within 5000 meters
    private static final int LIMIT = 20; // up to 20 places

    private static final HttpClient CLIENT = HttpClient.newHttpClient(); // connecting my program to Geoapify
    private static final Random RANDOM = new Random(); // random number generator

    public static String PlaceRandomizer(double latitude, double longitude) {
        String apiKey = System.getenv("GEOAPIFY_API_KEY"); // checking if Java can read my API
        if (apiKey == null || apiKey.isBlank()) { // checks if empty
            System.out.println("Missing API key");
            return null;
        } else {
            System.out.println("API key loaded");
        }

        // each category is to run on its own, so if one fails the others still run
        String restaurant = getRandomPickName("catering.restaurant", latitude, longitude, apiKey); // finds the restaurant
        String activity = getRandomPickName("tourism.attraction", latitude, longitude, apiKey); // finds the activity
        String hotel = getRandomPickName("accommodation.hotel", latitude, longitude, apiKey); // finds the hotel

        System.out.println("Restaurant: " + (restaurant != null ? restaurant : "nothing found"));
        System.out.println("Activity: " + (activity != null ? activity : "nothing found"));
        System.out.println("Hotel: " + (hotel != null ? hotel : "nothing found"));

        String result = " " + restaurant + " " + activity +" " + hotel;

        return result;
    }

    // Builds the Geoapify request URL for one category around one point
    public static String buildUrl(String category, double latitude, double longitude, String apiKey) {
        return BASE_URL
                + "?categories=" + category // which kind of place (restaurant, attraction, hotel)
                + "&filter=circle:" + longitude + "," + latitude + "," + RADIUS_METERS // longitude goes FIRST, then latitude
                + "&limit=" + LIMIT // up to 20 places
                + "&apiKey=" + apiKey; // adds the API key to the request URL
    }

    // Asks Geoapify for places and returns the list of places
    public static JsonArray fetchPlaces(String category, double latitude, double longitude, String apiKey)
            throws IOException, InterruptedException { // Throws an IOException if the request fails so the caller can handle it

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(buildUrl(category, latitude, longitude, apiKey)))
                .GET() // ask Geoapify to get the information
                .build();

        HttpResponse<String> response = CLIENT.send(
                request, HttpResponse.BodyHandlers.ofString()
        );
        System.out.println("Status (" + category + "): " + response.statusCode());

        if (response.statusCode() != 200) { // checks THIS request's response (not a different one)
            throw new IOException("Places search failed with status " + response.statusCode());
        }

        JsonObject searchResult = // reads my reply
                JsonParser.parseString(response.body()).getAsJsonObject();
        return searchResult.getAsJsonArray("features"); // gets the list of places
    }

    // Returns the place's name, or null if it doesn't have one
    public static String getPlaceName(JsonObject place) { // defines the method named getPlaceName
        if (place == null
                || !place.has("properties") // checks properties field exists
                || !place.get("properties").isJsonObject()) { // checks if properties contains an object
            return null;
        }

        JsonObject details = place.getAsJsonObject("properties"); // gets the name & address

        if (!details.has("name")) { // checks if the details includes a name
            return null;
        }
        if (details.get("name").isJsonNull()) { // checks if the field exists but has "no value"
            return null;
        }

        return details.get("name").getAsString(); // () is needed because getAsString is a method
    }

    // Picks one random place from the list, null if the list is empty
    public static JsonObject pickRandomPlace(JsonArray places) {
        if (places == null || places.size() == 0) { // empty list check
            return null;
        }
        JsonArray namedPlaces = new JsonArray(); // will hold only the places that have a name
        for (int i = 0; i < places.size(); i++) {
            JsonObject place = places.get(i).getAsJsonObject();
            if (getPlaceName(place) != null) { // keeps the place only if it has a name
                namedPlaces.add(place);
            }
        }

        if (namedPlaces.size() == 0) { // none of the places had a name
            return null;
        }

        int randomIndex = RANDOM.nextInt(places.size());
        return places.get(randomIndex).getAsJsonObject();
    }

    // Finds places for one category, picks a random one, and prints it
    public static String getRandomPickName(String category, double latitude, double longitude, String apiKey) {
        try {
            JsonArray places = fetchPlaces(category, latitude, longitude, apiKey);
            JsonObject selectedPlace = pickRandomPlace(places); // null if the list is empty
            return getPlaceName(selectedPlace); // null if no place or name
        } catch (IOException e) { // request failed
            System.out.println("Error (" + category + "): " + e.getMessage()); // shows why it failed
            return null;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
    }
}