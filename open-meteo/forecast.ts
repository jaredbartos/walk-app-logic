import { fetchWeatherApi } from 'openmeteo';
import { VariablesWithTime } from '@openmeteo/sdk/variables-with-time.js';
import {
  MinutelyWeatherData,
  DailyWeatherData,
  WeatherData,
  ParsedWeatherData,
  ParsedMinutelyWeatherData,
  ParsedDailyWeatherData,
  LocationPlusWeather,
  Location
} from '../definitions.js';

const fetchForecast = async (
  location: Location
): Promise<LocationPlusWeather | undefined> => {
  const { latitude, longitude } = location;

  const params = {
    latitude,
    longitude,
    minutely_15: [
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
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
    forecast_days: 14,
    forecast_minutely_15: 96,
    models: 'best_match'
  };
  const url = 'https://api.open-meteo.com/v1/forecast';

  try {
    const responses = await fetchWeatherApi(url, params);

    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    // Helper function to create sunrise/sunset arrays
    const createValuesInt64Array = (
      obj: VariablesWithTime,
      index: number
    ): number[] => {
      const arr: number[] = [];

      for (let i = 0; i < obj.variables(index)!.valuesInt64Length()!; i++) {
        arr.push(Number(obj.variables(index)!.valuesInt64(i)!));
      }

      return arr;
    };

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    // const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    // const latitude = response.latitude();
    // const longitude = response.longitude();

    const current = response.current()!;
    const minutely15 = response.minutely15()!;
    const hourly = response.hourly()!;
    const daily = response.daily()!;

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        weatherCode: current.variables(0)!.value()!,
        temperature2m: current.variables(1)!.value()!,
        relativeHumidity2m: current.variables(2)!.value()!,
        apparentTemperature: current.variables(3)!.value()!,
        precipitationProbability: current.variables(4)!.value()!,
        cloudCover: current.variables(5)!.value()!,
        visibility: current.variables(6)!.value()!,
        windSpeed10m: current.variables(7)!.value()!,
        windDirection10m: current.variables(8)!.value()!,
        windGusts10m: current.variables(9)!.value()!,
        uvIndex: current.variables(10)!.value()!,
        isDay: current.variables(11)!.value()!
      },
      minutely15: {
        time: range(
          Number(minutely15.time()),
          Number(minutely15.timeEnd()),
          minutely15.interval()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        weatherCode: minutely15.variables(0)!.valuesArray()!,
        temperature2m: minutely15.variables(1)!.valuesArray()!,
        relativeHumidity2m: minutely15.variables(2)!.valuesArray()!,
        apparentTemperature: minutely15.variables(3)!.valuesArray()!,
        precipitationProbability: minutely15.variables(4)!.valuesArray()!,
        cloudCover: minutely15.variables(5)!.valuesArray()!,
        visibility: minutely15.variables(6)!.valuesArray()!,
        windSpeed10m: minutely15.variables(7)!.valuesArray()!,
        windDirection10m: minutely15.variables(8)!.valuesArray()!,
        windGusts10m: minutely15.variables(9)!.valuesArray()!,
        uvIndex: minutely15.variables(10)!.valuesArray()!,
        isDay: minutely15.variables(11)!.valuesArray()!
      },
      hourly: {
        time: range(
          Number(hourly.time()),
          Number(hourly.timeEnd()),
          hourly.interval()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
        weatherCode: hourly.variables(0)!.valuesArray()!,
        temperature2m: hourly.variables(1)!.valuesArray()!,
        relativeHumidity2m: hourly.variables(2)!.valuesArray()!,
        apparentTemperature: hourly.variables(3)!.valuesArray()!,
        precipitationProbability: hourly.variables(4)!.valuesArray()!,
        cloudCover: hourly.variables(5)!.valuesArray()!,
        visibility: hourly.variables(6)!.valuesArray()!,
        windSpeed10m: hourly.variables(7)!.valuesArray()!,
        windDirection10m: hourly.variables(8)!.valuesArray()!,
        windGusts10m: hourly.variables(9)!.valuesArray()!,
        uvIndex: hourly.variables(10)!.valuesArray()!,
        isDay: hourly.variables(11)!.valuesArray()!
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
        sunrise: createValuesInt64Array(daily, 5).map(
          (t) => new Date((t + utcOffsetSeconds) * 1000)
        ),
        sunset: createValuesInt64Array(daily, 6).map(
          (t) => new Date((t + utcOffsetSeconds) * 1000)
        ),
        uvIndexMax: daily.variables(7)!.valuesArray()!,
        precipitationProbabilityMax: daily.variables(8)!.valuesArray()!,
        windSpeed10mMax: daily.variables(9)!.valuesArray()!,
        windGusts10mMax: daily.variables(10)!.valuesArray()!,
        windDirection10mDominant: daily.variables(11)!.valuesArray()!
      }
    };
    // Parse data to create convenient objects for analysis
    let parsedMinutely15Data: ParsedMinutelyWeatherData[] =
      parseWeatherData<MinutelyWeatherData>(weatherData.minutely15);
    let parsedHourlyData: ParsedMinutelyWeatherData[] =
      parseWeatherData<MinutelyWeatherData>(weatherData.hourly);
    const parsedDailyData: ParsedDailyWeatherData[] =
      parseWeatherData<DailyWeatherData>(weatherData.daily);

    // Fetch air quality data to merge with forecast
    const {
      current: { usAqi: currentUsAqi },
      hourly: hourlyAirQualityData
    } = await fetchAirQuality(latitude, longitude);

    // Merge air quality data
    parsedMinutely15Data = mergeAirQualityData(
      parsedMinutely15Data,
      hourlyAirQualityData
    );
    parsedHourlyData = mergeAirQualityData(
      parsedHourlyData,
      hourlyAirQualityData
    );

    return {
      ...location,
      timezoneAbbreviation,
      weatherData: {
        current: { ...weatherData.current, usAqi: currentUsAqi },
        minutely15: parsedMinutely15Data,
        hourly: parsedHourlyData,
        daily: parsedDailyData
      }
    };
  } catch (error) {
    console.log(error);
  }
};

const fetchAirQuality = async (latitude: number, longitude: number) => {
  const params = {
    latitude,
    longitude,
    current: 'us_aqi',
    hourly: 'us_aqi',
    timezone: 'auto',
    forecast_days: 7
  };
  const url = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  const responses = await fetchWeatherApi(url, params);

  // Helper function to form time ranges
  const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const utcOffsetSeconds = response.utcOffsetSeconds();
  // const timezone = response.timezone();
  // const timezoneAbbreviation = response.timezoneAbbreviation();
  // const latitude = response.latitude();
  // const longitude = response.longitude();

  const current = response.current()!;
  const hourly = response.hourly()!;

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      usAqi: current.variables(0)!.value()
    },
    hourly: {
      time: range(
        Number(hourly.time()),
        Number(hourly.timeEnd()),
        hourly.interval()
      ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
      usAqi: hourly.variables(0)!.valuesArray()!
    }
  };

  // Parse hourly data into time-separated objects for easier use
  const parsedHourlyAirData: { time: Date; usAqi: number }[] = [];
  for (let i = 0; i < weatherData.hourly.time.length; i++) {
    parsedHourlyAirData.push({
      time: weatherData.hourly.time[i],
      usAqi: weatherData.hourly.usAqi[i]
    });
  }

  return { current: weatherData.current, hourly: parsedHourlyAirData };
};

// Function to merge air quality data with existing hourly and 15 minute forecasts
const mergeAirQualityData = (
  weatherData: ParsedMinutelyWeatherData[],
  airQualityData: { time: Date; usAqi: number }[]
) => {
  const mapFn = (x: ParsedMinutelyWeatherData) => {
    for (let i = 0; i < airQualityData.length; i++) {
      if (
        x.time.getUTCDate() === airQualityData[i].time.getUTCDate() &&
        x.time.getUTCHours() === airQualityData[i].time.getUTCHours()
      ) {
        return {
          ...x,
          usAqi: airQualityData[i].usAqi
        };
      }
    }

    return x;
  };

  return weatherData.map(mapFn);
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
