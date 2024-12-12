import { fetchWeatherApi } from 'openmeteo';

import {
  HourlyWeatherData,
  DailyWeatherData,
  WeatherData,
  ParsedWeatherData,
  ParsedHourlyWeatherData,
  ParsedDailyWeatherData
} from '../definitions.js';

const fetchWeatherForecast = async (coordinates: {
  lat: number;
  lon: number;
}): Promise<
  | {
      timezone: string | null;
      timezoneAbbreviation: string | null;
      latitude: number;
      longitude: number;
      weatherData: {
        hourly: ParsedHourlyWeatherData[];
        daily: ParsedDailyWeatherData[];
      };
    }
  | never
> => {
  const { lat, lon } = coordinates;

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
    daily: ['temperature_2m_max', 'sunrise', 'sunset'],
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

    // `weatherData` now contains a simple structure with arrays for datetime and weather data
    // for (let i = 0; i < weatherData.hourly.time.length; i++) {
    //   console.log(
    //     weatherData.hourly.time[i].toISOString(),
    //     weatherData.hourly.temperature2m[i],
    //     weatherData.hourly.relativeHumidity2m[i],
    //     weatherData.hourly.apparentTemperature[i],
    //     weatherData.hourly.precipitationProbability[i],
    //     weatherData.hourly.cloudCover[i],
    //     weatherData.hourly.visibility[i],
    //     weatherData.hourly.windSpeed10m[i],
    //     weatherData.hourly.windGusts10m[i],
    //     weatherData.hourly.uvIndex[i],
    //     weatherData.hourly.isDay[i]
    //   );
    // }
    // for (let i = 0; i < weatherData.daily.time.length; i++) {
    //   console.log(
    //     weatherData.daily.time[i].toISOString(),
    //     weatherData.daily.temperature2mMax[i],
    //   );
    // }
    const parsedHourlyData: ParsedHourlyWeatherData[] =
      parseWeatherData<HourlyWeatherData>(weatherData.hourly);
    const parsedDailyData: ParsedDailyWeatherData[] =
      parseWeatherData<DailyWeatherData>(weatherData.daily);
    console.log(parsedHourlyData[0]);
    console.log(parsedDailyData[0]);
    console.log(timezone);
    console.log(timezoneAbbreviation);
    console.log(latitude);
    console.log(longitude);

    return {
      timezone,
      timezoneAbbreviation,
      latitude,
      longitude,
      weatherData: { hourly: parsedHourlyData, daily: parsedDailyData }
    };
  } catch (error) {
    console.log(error);
    throw new Error('Error retrieving weather with provided coordinates.');
  }
};

const parseWeatherData = <T extends WeatherData>(
  weatherData: T
): ParsedWeatherData<T>[] => {
  let parsedData: ParsedWeatherData<T>[] = [];
  const weatherKeys = Object.keys(weatherData) as (keyof T)[];

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
