
package org.GeauxTravelProject;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;

import org.GeauxTravelProject.service.DailyForecast;
import org.GeauxTravelProject.service.PlacesQuery;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class PlacesQueryTest {

    // Baton Rouge coordinates used for live API testing
    private static final double LATITUDE = 30.4515;
    private static final double LONGITUDE = -91.1871;

    // Seven-day trip used for itinerary testing
    private static final LocalDate START_DATE =
            LocalDate.of(2026, 11, 21);

    private static final LocalDate END_DATE =
            LocalDate.of(2026, 11, 27);

    // Creates a sample place without calling Geoapify.
    // This makes breakfast filtering tests predictable.
    private JsonObject createTestPlace(
            String name, String... categories) {

        JsonObject place = new JsonObject();
        JsonObject properties = new JsonObject();
        JsonArray categoryArray = new JsonArray();

        properties.addProperty("name", name);

        for (String category : categories) {
            categoryArray.add(category);
        }

        properties.add("categories", categoryArray);
        place.add("properties", properties);

        return place;
    }

    // TEST 1: Verify a seven-day itinerary is generated.
    @Test
    void testSevenDayItinerary() {

        JsonObject itinerary = PlacesQuery.generateDailyItinerary(
                LATITUDE, LONGITUDE, START_DATE, END_DATE
        );

        assertNotNull(itinerary);

        JsonArray days = itinerary.getAsJsonArray("days");

        assertNotNull(days);
        assertEquals(7, days.size());

        System.out.println("Generated itinerary: " + itinerary);
    }

    // TEST 2: Verify each day contains all three meal fields.
    @Test
    void testThreeMealsPerDay() {

        JsonObject itinerary = PlacesQuery.generateDailyItinerary(
                LATITUDE, LONGITUDE, START_DATE, END_DATE
        );

        JsonArray days = itinerary.getAsJsonArray("days");

        for (JsonElement element : days) {

            JsonObject day = element.getAsJsonObject();
            JsonObject restaurants =
                    day.getAsJsonObject("restaurants");

            assertNotNull(restaurants);

            assertTrue(restaurants.has("Breakfast"));
            assertTrue(restaurants.has("Lunch"));
            assertTrue(restaurants.has("Dinner"));

            assertFalse(restaurants.get("Breakfast").isJsonNull());
            assertFalse(restaurants.get("Lunch").isJsonNull());
            assertFalse(restaurants.get("Dinner").isJsonNull());
        }
    }

    // TEST 3: Verify restaurants are not repeated across days.
    @Test
    void testNoDuplicateRestaurants() {

        JsonObject itinerary = PlacesQuery.generateDailyItinerary(
                LATITUDE, LONGITUDE, START_DATE, END_DATE
        );

        Set<String> usedRestaurants = new HashSet<>();

        for (JsonElement element :
                itinerary.getAsJsonArray("days")) {

            JsonObject restaurants = element.getAsJsonObject()
                    .getAsJsonObject("restaurants");

            for (String meal : new String[]{
                    "Breakfast", "Lunch", "Dinner"}) {

                JsonElement value = restaurants.get(meal);

                // Skip missing recommendations.
                if (value == null || value.isJsonNull()) {
                    continue;
                }

                String name = value.getAsString();

                assertTrue(
                        usedRestaurants.add(name),
                        "Duplicate restaurant found: " + name
                );
            }
        }
    }

    // TEST 4: Verify activities are not repeated.
    @Test
    void testNoDuplicateActivities() {

        JsonObject itinerary = PlacesQuery.generateDailyItinerary(
                LATITUDE, LONGITUDE, START_DATE, END_DATE
        );

        Set<String> usedActivities = new HashSet<>();

        for (JsonElement element :
                itinerary.getAsJsonArray("days")) {

            JsonObject day = element.getAsJsonObject();
            JsonArray activities =
                    day.getAsJsonArray("activities");

            assertNotNull(activities);

            // The generator allows up to two activities per day.
            assertTrue(
                    activities.size() <= 2,
                    "A day contains more than two activities"
            );

            for (JsonElement activity : activities) {

                String name = activity.getAsString();

                assertTrue(
                        usedActivities.add(name),
                        "Duplicate activity found: " + name
                );
            }
        }
    }

    // TEST 5: Verify an end date before the start is rejected.
    @Test
    void testInvalidDates() {

        assertThrows(
                IllegalArgumentException.class,
                () -> PlacesQuery.generateDailyItinerary(
                        LATITUDE,
                        LONGITUDE,
                        LocalDate.of(2026, 11, 27),
                        LocalDate.of(2026, 11, 21)
                )
        );
    }

    // TEST 6: Verify trips longer than 30 days are rejected.
    @Test
    void testTripTooLong() {

        assertThrows(
                IllegalArgumentException.class,
                () -> PlacesQuery.generateDailyItinerary(
                        LATITUDE,
                        LONGITUDE,
                        LocalDate.of(2026, 11, 21),
                        LocalDate.of(2026, 12, 21)
                )
        );
    }

    // TEST 7: Exclude coffee-only establishments from breakfast.
    @Test
    void testCoffeeOnlyExcluded() {

        JsonObject place = createTestPlace(
                "Sample Coffee Shop",
                "catering.cafe",
                "catering.cafe.coffee_shop"
        );

        assertFalse(
                PlacesQuery.isBreakfastCandidate(place)
        );
    }

    // TEST 8: Accept restaurants as possible breakfast candidates.
    @Test
    void testRestaurantCandidateAccepted() {

        JsonObject place = createTestPlace(
                "Sample Breakfast Restaurant",
                "catering.restaurant"
        );

        assertTrue(
                PlacesQuery.isBreakfastCandidate(place)
        );
    }

    // TEST 9: Exclude bars from breakfast recommendations.
    @Test
    void testBarExcluded() {

        JsonObject place = createTestPlace(
                "Sample Bar",
                "catering.bar"
        );

        assertFalse(
                PlacesQuery.isBreakfastCandidate(place)
        );
    }

    // TEST 10: Handle malformed categories without crashing.
    @Test
    void testMalformedCategoriesHandled() {

        JsonObject place = createTestPlace(
                "Sample Cafe",
                "catering.cafe"
        );

        JsonArray categories = place
                .getAsJsonObject("properties")
                .getAsJsonArray("categories");

        // Add invalid category values.
        categories.add(JsonNull.INSTANCE);
        categories.add(new JsonObject());

        assertDoesNotThrow(
                () -> PlacesQuery.isBreakfastCandidate(place)
        );

        assertTrue(
                PlacesQuery.isBreakfastCandidate(place)
        );
    }

    //TEST 11: Weather-based filtering
    @Test
    void testWeatherFiltersOutdoorActivities() {

        // creates sample activities
        JsonArray activities = new JsonArray();

        JsonObject museum = new JsonObject();
        JsonObject museumDetails = new JsonObject();
        JsonArray museumCategories = new JsonArray();
        museumCategories.add("entertainment.museum");
        museumDetails.addProperty("name", "Art Museum");
        museumDetails.add("categories", museumCategories);
        museum.add("properties", museumDetails);
        activities.add(museum);

        JsonObject park = new JsonObject();
        JsonObject parkDetails = new JsonObject();
        JsonArray parkCategories = new JsonArray();
        parkCategories.add("leisure.park");
        parkDetails.addProperty("name", "City Park");
        parkDetails.add("categories", parkCategories);
        park.add("properties", parkDetails);
        activities.add(park);

        // creates rainy weather
        DailyForecast rainyDay = new DailyForecast(
                "2026-11-24", 70, 55, 0.5, "Moderate rain");

        // filters activities
        JsonArray filtered = PlacesQuery.filterActivitiesByWeather(
                activities, rainyDay);

        // checks that only the museum remains
        assertEquals(1, filtered.size());
        assertEquals("Art Museum",
                PlacesQuery.getPlaceName(filtered.get(0).getAsJsonObject()));
    }

    // TEST 12: Checks the pening hours of a resturant
    @Test
    void testOpeningHoursFilter() {

        // creates a restaurant
        JsonArray restaurants = new JsonArray();
        JsonObject restaurant = new JsonObject();
        JsonObject properties = new JsonObject();

        properties.addProperty("name", "Test Restaurant");
        properties.addProperty("opening_hours", "Mo-Fr 17:00-22:00");
        restaurant.add("properties", properties);
        restaurants.add(restaurant);

        // checks monday at lunchtime
        LocalDateTime lunchTime = LocalDateTime.of(2026, 11, 23, 12, 30);

        JsonArray available = PlacesQuery.filterByOpeningHours(
                restaurants, lunchTime);

        // checks that the closed restaurant is removed
        assertEquals(0, available.size());
    }


    

}
