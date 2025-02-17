interface WeatherData {
  time: Date[];
  [key: string]: any;
}

interface MinutelyWeatherData extends WeatherData {
  weatherCode: Float32Array;
  temperature2m: Float32Array;
  relativeHumidity2m: Float32Array;
  apparentTemperature: Float32Array;
  precipitationProbability: Float32Array;
  cloudCover: Float32Array;
  visibility: Float32Array;
  windSpeed10m: Float32Array;
  windDirection10m: Float32Array;
  windGusts10m: Float32Array;
  uvIndex: Float32Array;
  isDay: Float32Array;
}

interface DailyWeatherData extends WeatherData {
  temperature2mMax: Float32Array;
}

type ParsedWeatherData<T extends WeatherData> = {
  [K in keyof T]: T[K] extends Array<infer U> ? U : never;
};

interface ParsedMinutelyWeatherData {
  time: Date;
  weatherCode: number;
  temperature2m: number;
  relativeHumidity2m: number;
  apparentTemperature: number;
  precipitationProbability: number;
  cloudCover: number;
  visibility: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m: number;
  uvIndex: number;
  isDay: 0 | 1;
}

interface HourClass extends ParsedMinutelyWeatherData {
  idealTemp: number;
  flags: string[];
  weatherRating: number;
}

interface ParsedDailyWeatherData {
  time: Date;
  temperature2mMax: number;
}

type LocationData = {
  timezone: string | null;
  timezoneAbbreviation: string | null;
  latitude: number;
  longitude: number;
  name: string;
  admin1: string;
  country: string;
  weatherData: {
    hourly: ParsedMinutelyWeatherData[];
    daily: ParsedDailyWeatherData[];
  };
};

type Coordinates = {
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
};

type WeatherRatingFunc = (
  data: ParsedMinutelyWeatherData,
  idealTemp?: number
) => number;

export {
  MinutelyWeatherData,
  DailyWeatherData,
  WeatherData,
  ParsedWeatherData,
  ParsedMinutelyWeatherData,
  ParsedDailyWeatherData,
  LocationData,
  Coordinates,
  WeatherRatingFunc,
  HourClass
};
