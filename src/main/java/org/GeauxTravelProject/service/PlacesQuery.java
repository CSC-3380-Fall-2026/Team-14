package org.GeauxTravelProject.service;

import com.google.gson.JsonElement;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set; 

import java.io.IOException;
import java.util.Random;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.stereotype.Service;

// Randomized itinerary: restaurant, activity, and hotel
@Service
public class PlacesQuery {
    private static final String BASE_URL = "https://api.geoapify.com/v2/places"; // finds the places
    private static final int RADIUS_METERS = 10000; // searches around/within 10000 meters
    private static final int LIMIT = 100; // up to 100 places
    private static final int MAX_TRIP_DAYS = 30; // can't go past 30 trip days
    private static final int RESTAURANTS_PER_DAY = 3; // breakfast, lunch, and dinner suggestions
    private static final int ACTIVITIES_PER_DAY = 2; // up to 2 activities a day 

    private static final String[] MEAL_TYPES = {
        "Breakfast", "Lunch", "Dinner"
};

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
                JsonArray features = searchResult.getAsJsonArray("features");
    
                return features;
    }

    // Fetches places safely and returns an empty list if the request fails
    private static JsonArray fetchPlacesSafely(String category, double latitude, double longitude, String apiKey) {
        try {
            JsonArray places = fetchPlaces( category, latitude, longitude, apiKey);
            
            return places != null ? places : new JsonArray();
            
        } catch (IOException e) {
            System.out.println("Error fetching " + category + ": " + e.getMessage());
            
            return new JsonArray();
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            
            throw new IllegalStateException("Interrupted while fetching " + category, e);
        }
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

        int randomIndex = RANDOM.nextInt(namedPlaces.size());
        return namedPlaces.get(randomIndex).getAsJsonObject();
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

    //picks random places without repeating them across days
    public static List<String> getRandomNames(JsonArray places, int count, Set<String> used) {
        List<String> available = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        if (places == null || count <= 0) {
            return new ArrayList<>();
        }

        // get places that haven't been picked yet 
        for (int i = 0; i < places.size(); i++) {
            String name = getPlaceName(places.get(i).getAsJsonObject());
            
            if (name != null && !name.isBlank()
                && !used.contains(name) && seen.add(name)) {
            available.add(name);
    
            }
        }

        // mixes up the places
        Collections.shuffle(available, RANDOM);

         List<String> picked = new ArrayList<>();

        // picks up to the number of places needed
        for (String name : available) {
            if (picked.size() >= count) {
                break;
            }

            picked.add(name);
        }

        // remembers the places we picked
        used.addAll(picked);

        return picked;
    }

    // makes an itinerary for each day of the trip
    public static JsonObject generateDailyItinerary(double latitude, double longitude, LocalDate startDate, LocalDate endDate) {
        
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) { // checks if the dates are valid
            throw new IllegalArgumentException("Invalid trip dates");
        }

        long tripDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1; // counts how many days the trip is
       
        // stops trips longer than 30 days
        if (tripDays > MAX_TRIP_DAYS) {  
            throw new IllegalArgumentException("Trip cannot exceed 30 days");
        }
        // gets my Geoapify API key
        String apiKey = System.getenv("GEOAPIFY_API_KEY"); 
    
        // checks if the API key is missing
        if (apiKey == null || apiKey.isBlank()) {  
            throw new IllegalStateException("Missing Geoapify API key");
        }
        // stores the itinerary and each day
        JsonObject itinerary = new JsonObject(); 
        JsonArray days = new JsonArray();

       // finds places for each meal and activities
        JsonArray breakfastPlaces = fetchPlacesSafely("catering.cafe", latitude, longitude, apiKey);
        JsonArray restaurants = fetchPlacesSafely("catering.restaurant", latitude, longitude, apiKey);
        JsonArray activities = fetchPlacesSafely( "tourism.attraction,entertainment.museum,entertainment", latitude, longitude, apiKey);

        // Filter breakfast candidates before generating the itinerary
        JsonArray breakfastPool = new JsonArray();

        for (JsonElement element : breakfastPlaces) {

            if (!element.isJsonObject()) {
                continue;
            }

            JsonObject place = element.getAsJsonObject();

            if (isBreakfastCandidate(place)) {
                breakfastPool.add(place);
            }
        }
        // keeps track of places already picked
        Set<String> usedRestaurants = new HashSet<>();
        Set<String> usedActivities = new HashSet<>();
        
        // goes through each day of the trip
        for (LocalDate date = startDate;
            !date.isAfter(endDate);
            date = date.plusDays(1)) {
                
            JsonObject day = new JsonObject();
            day.addProperty("date", date.toString());

        // picks a place for breakfast
        List<String> breakfast = getRandomNames(breakfastPool, 1, usedRestaurants);

        // picks places for lunch and dinner
        List<String> otherMeals = getRandomNames( restaurants, 2, usedRestaurants);

        // puts each place with its meal
        JsonObject food = new JsonObject();

        food.addProperty("Breakfast", getNameAt(breakfast, 0));
        food.addProperty("Lunch", getNameAt(otherMeals, 0));
        food.addProperty("Dinner", getNameAt(otherMeals, 1));

        day.add("restaurants", food);

        // picks 2 activities for the day
        List<String> activityNames = getRandomNames(activities, ACTIVITIES_PER_DAY, usedActivities);

        JsonArray dailyActivities = new JsonArray();

        // adds the activities to the list
        for (String name : activityNames) {
            dailyActivities.add(name);
        }

        day.add("activities", dailyActivities);

        days.add(day);
    }

    // notifying if no places were found
    if (breakfastPlaces.size() == 0 && restaurants.size() == 0 && activities.size() == 0) {
        itinerary.addProperty("warning", "No places found or searches failed for this location");
    }

    // returns the full itinerary
    itinerary.add("days", days);
    return itinerary;
}

    // gets a name from the list without going past its size
    private static String getNameAt(List<String> names, int index) {

        // checks if the spot exists
        if (index >= 0 && index < names.size()) {
            return names.get(index);
        }

        // returns null if there isn't a name at that spot
        return null;
}
    // checks whether a place is a reasonable breakfast candidate
    public static boolean isBreakfastCandidate(JsonObject place) {

        String name = getPlaceName(place);

        if (name == null || name.isBlank()) {
            return false;
        }

        JsonObject properties = place.getAsJsonObject("properties");

        if (!properties.has("categories")
                || !properties.get("categories").isJsonArray()) {
            return false;
        }

        JsonArray categories = properties.getAsJsonArray("categories");

        boolean coffeeShop = false;
        boolean foodService = false;

        for (JsonElement element : categories) {

            // skip null values and objects to avoid crashes
            if (!element.isJsonPrimitive()
                    || !element.getAsJsonPrimitive().isString()) {
                continue;
            }

            String category = element.getAsString();

            // exclude categories that aren't suitable for breakfast
            if (category.equals("catering.bar")
                    || category.startsWith("catering.bar.")
                    || category.equals("catering.pub")
                    || category.startsWith("catering.pub.")
                    || category.equals("catering.biergarten")
                    || category.startsWith("catering.biergarten.")
                    || category.equals("catering.ice_cream")
                    || category.startsWith("catering.ice_cream.")) {
                return false;
            }

            if (category.equals("catering.cafe.coffee_shop")) {
                coffeeShop = true;
            }

            if (category.equals("catering.restaurant")
                    || category.startsWith("catering.restaurant.")
                    || category.equals("catering.fast_food")
                    || category.startsWith("catering.fast_food.")) {
                foodService = true;
            }
        }

        return !(coffeeShop && !foodService);
    }

    // represents whether a place is open at a certain time
    public enum OpeningStatus {
        OPEN,
        CLOSED,
        UNKNOWN
    }
    
    // checks basic opening hours for a planned visit, complex schedules return UNKNOWN instead of guessing.
    public static OpeningStatus evaluateOpeningHours(String hours, LocalDateTime visitTime) {           
            if (hours == null || visitTime == null || hours.isBlank())
                return OpeningStatus.UNKNOWN;

            if (hours.trim().equals("24/7"))
                return OpeningStatus.OPEN;

    // supports one weekday or a weekday range.
            Matcher match = Pattern.compile("(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?\\s+(\\d{2}:\\d{2})-(\\d{2}:\\d{2})").matcher(hours.trim());
            
            if (!match.matches())
                return OpeningStatus.UNKNOWN;

            String[] days = {"Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"};

            int start = java.util.Arrays.asList(days).indexOf(match.group(1));
            int end = match.group(2) == null
                    ? start : java.util.Arrays.asList(days).indexOf(match.group(2));

            int today = visitTime.getDayOfWeek().getValue() - 1;

            boolean correctDay = start <= end
                    ? today >= start && today <= end
                    : today >= start || today <= end;

            try {
                LocalTime opening = LocalTime.parse(match.group(3));
                LocalTime closing = match.group(4).equals("24:00")
                        ? LocalTime.MAX : LocalTime.parse(match.group(4));

                // overnight schedules are not supported yet.
                if (!closing.isAfter(opening))
                    return OpeningStatus.UNKNOWN;

                boolean correctTime = !visitTime.toLocalTime().isBefore(opening) && visitTime.toLocalTime().isBefore(closing);

                return correctDay && correctTime
                        ? OpeningStatus.OPEN : OpeningStatus.CLOSED;

        } catch (RuntimeException exception) {
            return OpeningStatus.UNKNOWN;
        }
}

}