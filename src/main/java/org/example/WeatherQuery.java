package org.example;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class WeatherQuery {
	
			
	public static String getWeatherForecast(double latitude, double longitude) { 
		if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
			
			return "Invalid coordinates.";
		}
	
	try {
			String url = String.format(
					"https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=temperature_2m,weather_code,apparent_temperature,precipitation&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch",
					latitude, longitude);

			URI uri = URI.create(url);
			HttpClient client = HttpClient.newHttpClient();

			HttpRequest request = HttpRequest.newBuilder().uri(uri).GET().build();

			HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
			 if (response.statusCode() != 200) {
				return "Unable to retrieve weather data.";
			}
			JsonObject root = JsonParser.parseString(response.body()).getAsJsonObject();
			
			if (!root.has("current")) {
				return "Weather data is unavailable for this location.";
			}
			
			JsonObject current = root.getAsJsonObject("current");
			
			if (!current.has("temperature_2m") 
					|| !current.has("apparent_temperature")
					|| !current.has ("precipitation")
					|| !current.has("weather_code")) {
				return "Incomplete weather data received.";
			}
				
			double temperature = current.get("temperature_2m").getAsDouble();
			double apparentTemperature = current.get("apparent_temperature").getAsDouble();
			double precipitation = current.get("precipitation").getAsDouble();
			int weatherCode = current.get("weather_code").getAsInt();
			
			String weatherDescription = getWeatherDescription(weatherCode);                                                   	

			String result = String.format(
					"Temperature: %.1f°F\nFeels Like: %.1f°F\nPrecipitation: %.2f in\nCondition: %s", temperature,
					apparentTemperature, precipitation, weatherDescription);

			return result;
		} catch (Exception e) {
			e.printStackTrace();
			return "An error occurred while retrieving weather information.";

		}

	}
	
	private static String getWeatherDescription(int weatherCode) {
		switch (weatherCode) {
		
		case 0: return "Clear sky";
		case 1: return "Mainly clear";
		case 2: return "Partly cloudy";
		case 3: return "Overcast";
		
		case 45: return "Fog";
		case 48: return "Depositing rime fog";
		
		case 51: return "Light drizzle";
		case 53: return "Moderate drizzle";
		case 55: return "Heavy drizzle";
		case 56,57: return "Freezing drizzle";
		
		case 61: return "Slight rain";
		case 63: return "Moderate rain";
		case 65: return "Heavy rain";
		case 66,67: return "Freezing rain";
		
		case 71: return "Slight snow";
		case 73: return "Moderate snow";
		case 75: return "Heavy snow";
		case 77: return "Snow grains";
		
		case 80: return "Slight rain showers";
		case 81: return "Moderate rain showers";
		case 82: return "Heavy rain showers";
		
		case 85: return "Slight snow showers";
		case 86: return "Heavy snow showers";
		
		case 95: return "Thunderstorm";
		case 96,99: return "Thunderstorm with hail";
		
		default: return "Unknown weather condition";
		
	}
	      
	}
}
