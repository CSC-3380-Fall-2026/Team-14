package org.GeauxTravelProject.service;

import java.math.BigDecimal;
import java.util.List;

public class TripPreferences {
    private String startDate;
    private String endDate;
    private BigDecimal budgetPerTraveler;
    private String currency;
    private Integer travelers;
    private List<String> interests;
    private String pace;
    private String notes;

//Constructor
public TripPreferences() {
}

public TripPreferences(
        String startDate,
        String endDate,
        BigDecimal budgetPerTraveler,
        String currency,
        Integer travelers,
        List<String> interests,
        String pace,
        String notes) {

    this.startDate = startDate;
    this.endDate = endDate;
    this.budgetPerTraveler = budgetPerTraveler;
    this.currency = currency;
    this.travelers = travelers;
    this.interests = interests;
    this.pace = pace;
    this.notes = notes;
}

// Get
    public String getStartDate() {
        return startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public BigDecimal getBudgetPerTraveler() {
        return budgetPerTraveler;
    }

    public String getCurrency() {
        return currency;
    }

    public Integer getTravelers() {
        return travelers;
    }

    public List<String> getInterests() {
        return interests;
    }

    public String getPace() {
        return pace;
    }

    public String getNotes() {
        return notes;
    }
}