package org.GeauxTravelProject.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Locale;

@Service
public class WeatherAdviceService {

    public String getWeatherAdvice(DailyForecast day) {

        if (day == null) {
            return "Weather information is unavailable. ";

        }

        String condition = day.getCondition();

        if (condition == null) {
            return "Check the local forecast before planning activities.";
        }

        condition = condition.toLowerCase(Locale.ROOT);

        double high = day.getHighTemperature();
        double low = day.getLowTemperature();

        if (condition.contains("thunderstorm")) {
            return "Thunderstorms are expected. Avoid outdoor "
            + "activities and consider indoor attractions. ";
        }

        if (condition.contains("rain")
            || condition.contains("drizzle")) {
        return "Rain is expected. Bring an umbrella and consider "
                + "indoor activities such as museums or restaurants.";
            }

            if (high > 95) {
                return "Very hot weather is expected. Stay hydrated, "
                        + "take breaks, and consider indoor activities.";
            }

            if (low < 32) {
                return "Freezing temperatures are possible. Dress warmly "
                        + "and prepare for cold outdoor conditions.";
            }

            if (condition.contains("clear")) {
                return "Great conditions for outdoor sightseeing, "
                        + "walking tours, and exploring the destination.";
            }

            if (condition.contains("cloudy")
                || condition.contains("overcast")) {
            return "Cloudy weather is expected, but many sightseeing "
                    + "and outdoor activities may still be enjoyable.";
                }

                return "Check the forecast before planning your activities.";
    }

    public Map<String,String> getSevenDayAdvice(
        List<DailyForecast> forecast) {

        Map<String, String> adviceByDate = new LinkedHashMap<>();

        if (forecast == null) {
            return adviceByDate;
        }

        for (DailyForecast day : forecast) {
            if (day != null) {
                String advice = getWeatherAdvice(day);
                adviceByDate.put(day.getDate(), advice);
            }
        }

        return adviceByDate;
        }
    
    
}
