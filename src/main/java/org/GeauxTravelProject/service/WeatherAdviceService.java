package org.GeauxTravelProject.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class WeatherAdviceService {

    public String getWeatherAdvice(DailyForecast day) {
        if (day == null) {
            return "Weather Information is unavailable.";
        }

        String condition = day.getCondition();

        if (condition == null) {
            return "Check the local forecast before planning activities.";
        }

        condition = condition.toLowerCase(Locale.ROOT);

        if (condition.contains("thunderstorm")) {
            return "Thunderstorms are expected. Avoid outdoor " + "activities and consider indoor attractions.";
        }

        if (condition.contains("snow") || condition.contains("freezing")) {
            return "Cold weather is expected. Dress warmly and check travel conditions. ";

        }
        if (condition.contains("rain")
            || condition.contains("drizzle")
            || condition.contains("showers")) {
                return "Rain is expected. Bring an umbrella and consider indoor activities such as musuems or restaurants.";

            }

            if (day.getHighTemperature() > 95) {
                return "Very hot weather is expected. Stay hydrated, take breaks, and consider indoor activities. ";

            }

            if (day.getLowTemperature() < 32) {
                return "Freezing temperatures are possible. Dress warmly and prepare for cold outdoor conditions. ";

            }

            if (condition.contains("fog")) {
                return "Foggy conditons are expected. Allow extra " + "travel time and be careful when driving. ";

            }

            if (condition.contains("clear")) {
                return "Great conditions for outdoor sightseeing, " + "walking tours, and exploring the destination.";
            }

            if (condition.contains("cloudy")
                || condition.contains("overcast")) {
            return "Cloudy weather is expected, but is still " + "a good opportunity for sightseeing and " + "exploring local attractions.";


    }
    return "Conditons are expected to be "
    + day.getCondition().toLowerCase(Locale.ROOT)
    + ". Check for any weather changes before " + "heading out.";


}

public Map<String,String> getSevenDayAdvice(
    List<DailyForecast> forecast) {

        Map<String, String> adviceByDate = new LinkedHashMap<>();

        if (forecast == null) {
            return adviceByDate;
        }

        for (DailyForecast day : forecast) {
            if (day != null) {
                adviceByDate.put(
                    day.getDate(),
                    getWeatherAdvice(day)
                );
            }
        }


    return adviceByDate;
}
}
