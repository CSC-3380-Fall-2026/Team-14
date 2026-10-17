package org.example;

public class FlightQueury {
    public String leave_airportName;
    public String leave_airportCode;
    public String leave_departureTime;
    public String arrive_airportName;
    public String arrive_airportCode;
    public String arrive_departureTime;
    public Integer duration;
    public String airline;
    public String travel_class;
    public String flight_number;
    public Boolean flight_overnight;
    public Integer price;
    public Integer layover_duration;
    public String layover_name;
    public String layover_id;
    public Boolean layover_overnight;


    public FlightQueury(String leave_airportName, String leave_airportCode, String leave_departureTime, String arrive_airportName,
                        String arrive_airportCode, String arrive_departureTime, Integer duration, String airline, String travel_class,
                        String flight_number, Boolean flight_overnight, Integer price, Integer layover_duration, String layover_name,
                        String layover_id, Boolean layover_overnight) {

        this.leave_airportName = leave_airportName;
        this.leave_airportCode = leave_airportCode;
        this.leave_departureTime = leave_departureTime;
        this.arrive_airportName = arrive_airportName;
        this.arrive_airportCode = arrive_airportCode;
        this.arrive_departureTime = arrive_departureTime;
        this.duration = duration;
        this.airline = airline;
        this.travel_class = travel_class;
        this.flight_number = flight_number;
        this.flight_overnight = flight_overnight;
        this.price = price;
        this.layover_duration = layover_duration;
        this.layover_name = layover_name;
        this.layover_id = layover_id;
        this.layover_overnight = layover_overnight;
    }

}


