import java.util.Random;

//Sample code for testing and API is pending //

public class ItineraryRandomizer {
    public static void main(String[] args) {
        String [] restaurants = {"Urban Roast", "Clyde's", "Succotash"};
        String [] activities = {"Go clubbing", "Go to museums", "Visit historical monuments"};
        String [] placesToStay = {"Marriott", "Airbnb", "Holiday Inn"};

        Random random = new Random();
        int randomIndex = random.nextInt(restaurants.length);
        int activityIndex = random.nextInt(activities.length);
        int placesIndex = random.nextInt(placesToStay.length);

        System.out.println(restaurants[randomIndex]);
        System.out.println(activities[activityIndex]); 
        System.out.println(placesToStay[placesIndex]);

    }
}

