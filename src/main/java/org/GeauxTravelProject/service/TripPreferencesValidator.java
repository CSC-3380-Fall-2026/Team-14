package org.GeauxTravelProject.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class TripPreferencesValidator {

    public static List<String> validate(TripPreferences preferences) {
        List<String> errors = new ArrayList<>();

        if (preferences == null) {
            errors.add("Trip preferences are required.");
            return errors;
        }

        // Check the dates.
        LocalDate startDate = parseDate(
            preferences.getStartDate(), "Start date", errors
        );

        LocalDate endDate = parseDate(
            preferences.getEndDate(), "End date", errors
        );

        if (startDate != null && endDate != null
                && endDate.isBefore(startDate)) {
            errors.add("End date cannot be before start date.");
        }

        // Check the budget.
        BigDecimal budget = preferences.getBudgetPerTraveler();

        if (budget == null || budget.compareTo(BigDecimal.ZERO) <= 0) {
            errors.add("Budget must be greater than 0.");
        } else if (budget.stripTrailingZeros().scale() > 2) {
            errors.add("Budget must have at most two decimal places.");
        }

        // Check the number of travelers.
        Integer travelers = preferences.getTravelers();

        if (travelers == null || travelers < 1) {
            errors.add("Number of travelers must be at least 1.");
        }

        // Check the currency.
        String currency = preferences.getCurrency();

        if (currency == null
                || !Set.of("USD", "EUR").contains(currency)) {
            errors.add("Currency must be USD or EUR.");
        }

        // Check interests. An empty list is allowed.
        Set<String> allowedInterests =
            Set.of("Food", "Art", "Outdoors", "History");

        if (preferences.getInterests() != null) {
            for (String interest : preferences.getInterests()) {
                if (interest == null
                        || !allowedInterests.contains(interest)) {
                    errors.add("An interest is not supported.");
                    break;
                }
            }
        }

        // Check the daily pace.
        String pace = preferences.getPace();

        if (pace == null
                || !Set.of("Relaxed", "Standard", "Active").contains(pace)) {
            errors.add("Daily pace must be Relaxed, Standard, or Active.");
        }

        return errors;
    }

    private static LocalDate parseDate(
            String value, String fieldName, List<String> errors) {

        if (value == null || value.isBlank()) {
            errors.add(fieldName + " is required.");
            return null;
        }

        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            errors.add(fieldName + " must be a valid date in YYYY-MM-DD format.");
            return null;
        }
    }
}