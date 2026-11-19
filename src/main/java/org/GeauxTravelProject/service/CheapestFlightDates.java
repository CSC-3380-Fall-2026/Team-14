package org.GeauxTravelProject.service;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;

public final class CheapestFlightDates {

    private CheapestFlightDates() {
    }

    public record Result(LocalDate outboundDate, LocalDate returnDate, int price) {
    }

    public static Optional<Result> findCheapest(JsonObject calendar) {
        if (calendar == null || calendar.has("error")) {
            return Optional.empty();
        }

        JsonElement prices = calendar.get("prices");
        if (prices == null || !prices.isJsonArray()) {
            return Optional.empty();
        }

        Result cheapest = null;

        for (JsonElement entry : prices.getAsJsonArray()) {
            if (!entry.isJsonObject()) {
                continue;
            }

            JsonObject row = entry.getAsJsonObject();
            JsonElement outbound = row.get("outbound_date");
            JsonElement returning = row.get("return_date");
            JsonElement price = row.get("price");

            if (outbound == null || !outbound.isJsonPrimitive()
                    || returning == null || !returning.isJsonPrimitive()
                    || price == null || !price.isJsonPrimitive()
                    || !price.getAsJsonPrimitive().isNumber()) {
                continue;
            }

            try {
                LocalDate outboundDate = LocalDate.parse(outbound.getAsString());
                LocalDate returnDate = LocalDate.parse(returning.getAsString());
                int amount = price.getAsBigDecimal().intValueExact();

                if (amount <= 0 || returnDate.isBefore(outboundDate)) {
                    continue;
                }

                if (cheapest == null || amount < cheapest.price()) {
                    cheapest = new Result(outboundDate, returnDate, amount);
                }
            } catch (DateTimeParseException | NumberFormatException | ArithmeticException e) {
                // Skip rows with invalid dates or prices.
            }
        }

        return Optional.ofNullable(cheapest);
    }
}