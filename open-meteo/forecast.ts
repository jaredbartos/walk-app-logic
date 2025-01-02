import { fetchWeatherApi } from 'openmeteo';
import {
  HourlyWeatherData,
  DailyWeatherData,
  WeatherData,
  ParsedWeatherData,
  ParsedHourlyWeatherData,
  ParsedDailyWeatherData,
  LocationData,
  Coordinates
} from '../definitions.js';

const fetchWeatherForecast = async (
  coordinates: Coordinates
): Promise<LocationData | undefined> => {
  const { latitude: lat, longitude: lon, name, admin1, country } = coordinates;

  const params = {
    latitude: lat,
    longitude: lon,
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_gusts_10m',
      'uv_index',
      'is_day'
    ],
    daily: ['temperature_2m_max'],
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
    models: 'best_match'
  };
  const url = 'https://api.open-meteo.com/v1/forecast';

  try {
    const responses = await fetchWeatherApi(url, params);

    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const hourly = response.hourly()!;
    const daily = response.daily()!;

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {
      hourly: {
        time: range(
          Number(hourly.time()),
          Number(hourly.timeEnd()),
          hourly.interval()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        temperature2m: hourly.variables(0)!.valuesArray()!,
        relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
        apparentTemperature: hourly.variables(2)!.valuesArray()!,
        precipitationProbability: hourly.variables(3)!.valuesArray()!,
        cloudCover: hourly.variables(4)!.valuesArray()!,
        visibility: hourly.variables(5)!.valuesArray()!,
        windSpeed10m: hourly.variables(6)!.valuesArray()!,
        windGusts10m: hourly.variables(7)!.valuesArray()!,
        uvIndex: hourly.variables(8)!.valuesArray()!,
        isDay: hourly.variables(9)!.valuesArray()!
      },
      daily: {
        time: range(
          Number(daily.time()),
          Number(daily.timeEnd()),
          daily.interval()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        temperature2mMax: daily.variables(0)!.valuesArray()!
      }
    };
    // Parse data to create convenient objects for analysis
    const parsedHourlyData: ParsedHourlyWeatherData[] =
      parseWeatherData<HourlyWeatherData>(weatherData.hourly);
    const parsedDailyData: ParsedDailyWeatherData[] =
      parseWeatherData<DailyWeatherData>(weatherData.daily);

    return {
      timezone,
      timezoneAbbreviation,
      latitude,
      longitude,
      name,
      admin1,
      country,
      weatherData: { hourly: parsedHourlyData, daily: parsedDailyData }
    };
  } catch (error) {
    console.log(error);
  }
};

const parseWeatherData = <T extends WeatherData>(
  weatherData: T
): ParsedWeatherData<T>[] => {
  let parsedData: ParsedWeatherData<T>[] = [];
  const weatherKeys = Object.keys(weatherData) as (keyof T)[];

  // Loop through data and create objects for each time
  for (let i = 0; i < weatherData.time.length; i++) {
    let weatherObj = {} as ParsedWeatherData<T>;
    weatherKeys.forEach((key) => {
      weatherObj[key] = weatherData[key][i];
    });
    parsedData.push(weatherObj);
  }

  return parsedData;
};

export { fetchWeatherForecast };
