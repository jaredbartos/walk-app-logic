import {
  ParsedDailyWeatherData,
  ParsedHourlyWeatherData,
  HourClass,
  DayClass
} from './definitions.js';
import { getWeatherRating } from './utils/weather-rating.js';

class Hour implements HourClass {
  time;
  temperature2m;
  relativeHumidity2m;
  apparentTemperature;
  precipitationProbability;
  cloudCover;
  visibility;
  windSpeed10m;
  windGusts10m;
  uvIndex;
  isDay;
  idealTemp;

  constructor(weatherData: ParsedHourlyWeatherData, idealTemp = 70) {
    this.time = weatherData.time;
    this.temperature2m = weatherData.temperature2m;
    this.apparentTemperature = weatherData.apparentTemperature;
    this.relativeHumidity2m = weatherData.relativeHumidity2m;
    this.precipitationProbability = weatherData.precipitationProbability;
    this.cloudCover = weatherData.cloudCover;
    this.visibility = weatherData.visibility;
    this.windSpeed10m = weatherData.windSpeed10m;
    this.windGusts10m = weatherData.windGusts10m;
    this.uvIndex = weatherData.uvIndex;
    this.isDay = weatherData.isDay;
    this.idealTemp = idealTemp;
  }

  calcRating = () =>
    getWeatherRating(
      {
        time: this.time,
        temperature2m: this.temperature2m,
        relativeHumidity2m: this.relativeHumidity2m,
        apparentTemperature: this.apparentTemperature,
        precipitationProbability: this.precipitationProbability,
        cloudCover: this.cloudCover,
        visibility: this.visibility,
        windSpeed10m: this.windSpeed10m,
        windGusts10m: this.windGusts10m,
        uvIndex: this.uvIndex,
        isDay: this.isDay
      },
      this.idealTemp
    );

  weatherRating = this.calcRating();
}

class Day implements DayClass {
  date;
  month;
  year;
  dailyWeather;
  hourlyWeather: HourClass[] = [];

  constructor(
    date: number,
    month: number,
    year: number,
    dailyWeather: ParsedDailyWeatherData
  ) {
    this.date = date;
    this.month = month;
    this.year = year;
    this.dailyWeather = dailyWeather;
  }

  addHourlyWeather = (hourlyWeatherData: ParsedHourlyWeatherData[]) => {
    const hours = hourlyWeatherData.filter(
      (hour) =>
        hour.time.getUTCDate() === this.date &&
        hour.time.getUTCMonth() === this.month &&
        hour.time.getUTCFullYear() === this.year
    );

    hours.forEach((hour) => {
      this.hourlyWeather.push(new Hour(hour));
    });
  };
}

export { Hour, Day };
