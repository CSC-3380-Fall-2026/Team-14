package org.example;


/**
 * Represents the weather forecast for a single day.
 * Stores the date, high, and low temperatures, precipitation,
 * and weather conditions for a location.
 */
public class DailyForecast {

    private final String date;
    private final double highTemperature;
    private final double lowTemperature;
    private final double precipitation;
    private final String condition;


    /**
     * Creates a DailyForecast object containing weather data for one day.
     *
     * @param date date of the forecast
     * @param highTemperature predicted high temperature in Fahrenheit
     * @param lowTemperature predicted low temperature in Fahrenheit
     * @param precipitation predicted precipitation in inches
     * @param condition description of the weather conditions
     */
    public DailyForecast(String date, double highTemperature, double lowTemperature, double precipitation, String condition) {
        this.date = date;
        this.highTemperature = highTemperature;
        this.lowTemperature = lowTemperature;
        this.precipitation = precipitation;
        this.condition = condition;
    }
    /**
     * Returns the date of the weather forecast.
     *
     * @return forecast date
     */
    public String getDate() {
        return date;
    }

    /**
     * Returns the predicted high temperature for the day.
     *
     * @return high temperature in Fahrenheit
     */
    public double getHighTemperature() {
        return highTemperature;
    }

    /**
     * Returns the predicted low temperature for the day.
     *
     * @return low temperature in Fahrenheit
     */
    public double getLowTemperature() {
        return lowTemperature;
    }

    /**
     * Returns the predicted amount of precipitation for the day.
     *
     * @return precipitation in inches
     */
    public double getPrecipitation(){
        return precipitation;
    }

    /**
     * Returns a description of the predicted weather conditions.
     *
     * @return weather condition description
     */
    public String getCondition(){
        return condition;
    }


}