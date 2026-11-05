package org.example.controller;

import org.example.FlightAPI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "http://localhost:3000")

public class FlightController {

    @Autowired
    private FlightAPI flightService;


    @PostMapping("/click")
    public ResponseEntity<String> handleMapClick(@RequestBody CoordinatePayload payload) {
        // 1. Grab coordinates sent from frontend
        double lat = payload.getLatitude();
        double lng = payload.getLongitude();

        // 2. Pass them to your team's logic file
        String result = flightService.generateFlight(lat, lng);

        // 3. Send the answer back to the frontend
        return ResponseEntity.ok(result);

        //@GetMapping("/hello")
    //public String sayHello() {
        //return "Hello from Spring Boot!";
    }
}

