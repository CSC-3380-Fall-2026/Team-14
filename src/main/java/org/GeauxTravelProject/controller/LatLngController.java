package org.GeauxTravelProject.controller;

//import org.GeauxTravelProject.service.PlacesQueury;
import org.GeauxTravelProject.service.CoordinateGroupCall;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/itinerary")//needs to be changed to the url of the map page ie. home page
@CrossOrigin(origins = "http://localhost:5173")

public class LatLngController {

    @Autowired
    private CoordinateGroupCall GroupDataCall;


    @PostMapping("/click") //when they click the button
    public ResponseEntity<Map<String, Object>> receiveCoordinates(@RequestBody CoordinateRequest data) {
        //Grab coordinates sent from frontend
        double lat = data.getLatitude();
        double lng = data.getLongitude();
        //test if frontend received lat lng
        System.out.println("========================================");
        System.out.println("🚀 RECEIVED DATA FROM FRONTEND!");
        System.out.println("📍 Latitude:  " + lat);
        System.out.println("📍 Longitude: " + lng);
        System.out.println("========================================\n");

        Map<String, Object> result = GroupDataCall.gatherAllData(lat, lng);

        //test if backend processed info
        System.out.println("📦 Service Result Map:\n " + result);
        System.out.println("========================================");

        //Send the answer back to the frontend
        return ResponseEntity.ok(result);

    }
}
