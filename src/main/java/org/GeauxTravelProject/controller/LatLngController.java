package org.GeauxTravelProject.controller;

//import org.GeauxTravelProject.service.PlacesQueury;
import org.GeauxTravelProject.service.CoordinateGroupCall;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/map")//needs to be changed to the url of the map page ie. home page
@CrossOrigin(origins = "http://localhost:5173/")

public class LatLngController {

    @Autowired
    private CoordinateGroupCall GroupDataCall;


    @PostMapping("/click") //changed to when they click the button
    public ResponseEntity<Map<String, Object>> receiveCoordinates(@RequestBody CoordinateRequest data) {
        //Grab coordinates sent from frontend
        double lat = data.getLatitude();
        double lng = data.getLongitude();

        //Pass them to your team's backend
        Map<String, Object> result = GroupDataCall.gatherAllData(lat, lng);

        //Send the answer back to the frontend
        return ResponseEntity.ok(result);


    }
}
