package org.example;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class WeatherQuery {

	public static String getWeatherForecast(double latitude, double longitude) {
		try {
			String url = String.format(
					"https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=temperature_2m,weather_code,apparent_temperature,precipitation&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch",
					latitude, longitude);

			URI uri = URI.create(url);
			HttpClient client = HttpClient.newHttpClient();

			HttpRequest request = HttpRequest.newBuilder().uri(uri).GET().build();

			HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

			JsonObject root = JsonParser.parseString(response.body()).getAsJsonObject();
			JsonObject current = root.getAsJsonObject("current");

			double temperature = current.get("temperature_2m").getAsDouble();
			double apparentTemperature = current.get("apparent_temperature").getAsDouble();
			double precipitation = current.get("precipitation").getAsDouble();
			int weatherCode = current.get("weather_code").getAsInt();

			String result = String.format(
					"Temperature: %.1f°F\nFeels Like: %.1f°F\nPrecipitation: %.2f in\nWeather Code: %d", temperature,
					apparentTemperature, precipitation, weatherCode);

			return result;
		} catch (Exception e) {
			e.printStackTrace();
			return null;

		}

	}

}
