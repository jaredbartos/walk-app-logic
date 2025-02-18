interface WeatherData {
  time: Date[];
  weatherCode: Float32Array;
  [key: string]: any;
}

interface MinutelyWeatherData extends WeatherData {
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
  temperature2mMin: Float32Array;
  apparentTemperatureMax: Float32Array;
  apparentTemperatureMin: Float32Array;
  sunrise: Date[];
  sunset: Date[];
  uvIndexMax: Float32Array;
  precipitationProbabilityMax: Float32Array;
  windSpeed10mMax: Float32Array;
  windGusts10mMax: Float32Array;
  windDirection10mDominant: Float32Array;
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
  isDay: number;
  usAqi?: number;
}

interface MinutelyWeatherClass extends ParsedMinutelyWeatherData {
  idealTemp: number;
  flags: string[];
  weatherRating: number;
}

interface ParsedDailyWeatherData {
  time: Date;
  weatherCode: number;
  temperature2mMax: number;
  temperature2mMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  sunrise: Date;
  sunset: Date;
  uvIndexMax: number;
  precipitationProbabilityMax: number;
  windSpeed10mMax: number;
  windGusts10mMax: number;
  windDirection10mDominant: number;
}

type ParsedTotalForecastData = {
  current: ParsedMinutelyWeatherData;
  minutely15: ParsedMinutelyWeatherData[];
  hourly: ParsedMinutelyWeatherData[];
  daily: ParsedDailyWeatherData[];
};

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id: number;
  admin2_id: number;
  admin3_id: number;
  admin4_id?: number;
  timezone: string;
  population: number;
  postcodes: string[];
  country_id: number;
  country: string;
  admin1: string;
  admin2: string;
  admin3: string;
  admin4?: string;
}

interface LocationPlusWeather extends Location {
  timezoneAbbreviation: string | null;
  weatherData: ParsedTotalForecastData;
}

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
  LocationPlusWeather,
  ParsedTotalForecastData,
  Location,
  WeatherRatingFunc,
  MinutelyWeatherClass
};
