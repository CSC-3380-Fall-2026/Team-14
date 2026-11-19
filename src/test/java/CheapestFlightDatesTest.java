package org.GeauxTravelProject;

import com.google.gson.JsonParser;
import org.GeauxTravelProject.service.CheapestFlightDates;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CheapestFlightDatesTest {

    @Test
    void picksCheapestValidRoundTrip() {
        var calendar = JsonParser.parseString("""
            {
              "prices": [
                {"outbound_date":"2026-12-10","return_date":"2026-12-17","price":340},
                {"outbound_date":"2026-12-11","return_date":"2026-12-18","price":260},
                {"outbound_date":"2026-12-12","price":100}
              ]
            }
            """).getAsJsonObject();

        var result = CheapestFlightDates.findCheapest(calendar).orElseThrow();

        assertEquals(260, result.price());
        assertEquals(LocalDate.of(2026, 12, 11), result.outboundDate());
        assertEquals(LocalDate.of(2026, 12, 18), result.returnDate());
    }
}