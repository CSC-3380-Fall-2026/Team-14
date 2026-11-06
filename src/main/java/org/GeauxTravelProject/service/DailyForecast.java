package org.GeauxTravelProject.service;

public class DailyForecast {

    private final String date;
    private final double highTemperature;
    private final double lowTemperature;
    private final double precipitation;
    private final String condition;

    public DailyForecast(String date, double highTemperature, double lowTemperature, double precipitation, String condition) {
        this.date = date;
        this.highTemperature = highTemperature;
        this.lowTemperature = lowTemperature;
        this.precipitation = precipitation;
        this.condition = condition;
    }

    public String getDate() {
        return date;
    }
    public double getHighTemperature() {
        return highTemperature;
    }
    public double getLowTemperature() {
        return lowTemperature;
    }
    public double getPrecipitation(){
        return precipitation;
    }
    public String getCondition(){
        return condition;
    }

    
}