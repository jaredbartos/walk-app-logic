import { fetchWeatherApi } from 'openmeteo';
import { VariablesWithTime } from '@openmeteo/sdk/variables-with-time.js';
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

const fetchForecast = async (
  coordinates: Coordinates
): Promise<LocationData | undefined> => {
  const { latitude: lat, longitude: lon, name, admin1, country } = coordinates;

  const params = {
    latitude: lat,
    longitude: lon,
    hourly: [
      'weather_code',
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
      'is_day'
    ],
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant'
    ],
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ],
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
    forecast_days: 14,
    models: 'best_match'
  };
  const url = 'https://api.open-meteo.com/v1/forecast';

  try {
    const responses = await fetchWeatherApi(url, params);

    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    // Helper function to create sunrise/sunset arrays
    const createArray = (
      obj: VariablesWithTime,
      index: number,
      length: number
    ): number[] => {
      const arr: number[] = [];

      for (let i = 0; i < length; i++) {
        arr.push(Number(obj.variables(index)!.valuesInt64(i)!));
      }

      return arr;
    };

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const current = response.current()!;
    const hourly = response.hourly()!;
    const daily = response.daily()!;

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature2m: current.variables(0)!.value(),
        relativeHumidity2m: current.variables(1)!.value(),
        apparentTemperature: current.variables(2)!.value(),
        isDay: current.variables(3)!.value(),
        precipitation: current.variables(4)!.value(),
        weatherCode: current.variables(5)!.value(),
        cloudCover: current.variables(6)!.value(),
        windSpeed10m: current.variables(7)!.value(),
        windDirection10m: current.variables(8)!.value(),
        windGusts10m: current.variables(9)!.value()
      },
      hourly: {
        time: range(
          Number(hourly.time()),
          Number(hourly.timeEnd()),
          hourly.interval()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        weatherCode: hourly.variables(1)!.valuesArray()!,
        temperature2m: hourly.variables(0)!.valuesArray()!,
        relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
        apparentTemperature: hourly.variables(2)!.valuesArray()!,
        precipitationProbability: hourly.variables(3)!.valuesArray()!,
        cloudCover: hourly.variables(4)!.valuesArray()!,
        visibility: hourly.variables(5)!.valuesArray()!,
        windSpeed10m: hourly.variables(6)!.valuesArray()!,
        windDirection10m: hourly.variables(2)!.valuesArray()!,
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
        weatherCode: daily.variables(0)!.valuesArray()!,
        temperature2mMax: daily.variables(1)!.valuesArray()!,
        temperature2mMin: daily.variables(2)!.valuesArray()!,
        apparentTemperatureMax: daily.variables(3)!.valuesArray()!,
        apparentTemperatureMin: daily.variables(4)!.valuesArray()!,
        sunrise: createArray(
          daily,
          5,
          daily.variables(5)!.valuesInt64Length()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        sunset: createArray(
          daily,
          6,
          daily.variables(6)!.valuesInt64Length()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        uvIndexMax: daily.variables(7)!.valuesArray()!,
        precipitationProbabilityMax: daily.variables(8)!.valuesArray()!,
        windSpeed10mMax: daily.variables(9)!.valuesArray()!,
        windGusts10mMax: daily.variables(10)!.valuesArray()!,
        windDirection10mDominant: daily.variables(11)!.valuesArray()!
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

export { fetchForecast };
