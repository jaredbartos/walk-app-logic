import {
  ParsedDailyWeatherData,
  ParsedMinutelyWeatherData,
  MinutelyWeatherClass,
  ParsedTotalForecastData
} from './definitions.js';
import { getWeatherRating } from './utils/weather-rating.js';

class MinutelyWeather implements MinutelyWeatherClass {
  readonly time;
  readonly weatherCode;
  readonly windDirection10m;
  readonly temperature2m;
  readonly relativeHumidity2m;
  readonly apparentTemperature;
  readonly precipitationProbability;
  readonly cloudCover;
  readonly visibility;
  readonly windSpeed10m;
  readonly windGusts10m;
  readonly uvIndex;
  readonly isDay;
  readonly idealTemp;
  readonly usAqi;

  constructor(weatherData: ParsedMinutelyWeatherData, idealTemp = 70) {
    this.time = weatherData.time;
    this.weatherCode = weatherData.weatherCode;
    this.windDirection10m = weatherData.windDirection10m;
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
    this.usAqi = weatherData.usAqi;
  }

  get weatherRating() {
    return getWeatherRating(
      {
        time: this.time,
        weatherCode: this.weatherCode,
        windDirection10m: this.windDirection10m,
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
  }

  get flags() {
    const flags: string[] = [];

    if (this.temperature2m < 30) {
      flags.push('Low Temperature');
    }
    if (this.temperature2m > 80) {
      flags.push('High Temperature');
    }
    if (this.temperature2m < 30 && this.apparentTemperature < 0) {
      flags.push('Wind Chill');
    }
    if (this.temperature2m > 70 && this.apparentTemperature > 85) {
      flags.push('Heat Index');
    }
    if (this.visibility < 5000) {
      flags.push('Low Visibility');
    }
    if (this.windSpeed10m > 20) {
      flags.push('High Wind Speed');
    }
    if (this.windGusts10m > 30) {
      flags.push('High Wind Gusts');
    }
    if (this.uvIndex >= 3) {
      flags.push('UV Index');
    }
    if (this.usAqi !== undefined && this.usAqi > 100) {
      flags.push('Air Quality Index');
    }

    return flags;
  }
}

class Day {
  readonly date;
  readonly month;
  readonly year;
  readonly dailyWeather;
  readonly hourlyWeather: MinutelyWeather[] = [];
  readonly minutely15Weather: MinutelyWeather[] = [];
  readonly idealTemp;

  constructor(dailyWeather: ParsedDailyWeatherData, idealTemp = 70) {
    this.date = dailyWeather.time.getUTCDate();
    this.month = dailyWeather.time.getUTCMonth();
    this.year = dailyWeather.time.getUTCFullYear();
    this.dailyWeather = dailyWeather;
    this.idealTemp = idealTemp;
  }

  addMinutelyWeather(weatherData: ParsedTotalForecastData) {
    const filterAndAdd = (
      weatherData: ParsedTotalForecastData,
      frequency: 'hourly' | 'minutely15'
    ) => {
      const dates = weatherData[frequency].filter(
        (x) =>
          x.time.getUTCDate() === this.date &&
          x.time.getUTCMonth() === this.month &&
          x.time.getUTCFullYear() === this.year
      );

      dates.forEach((date) =>
        frequency === 'hourly'
          ? this.hourlyWeather.push(new MinutelyWeather(date, this.idealTemp))
          : this.minutely15Weather.push(
              new MinutelyWeather(date, this.idealTemp)
            )
      );
    };

    filterAndAdd(weatherData, 'hourly');
    filterAndAdd(weatherData, 'minutely15');
  }
}

export { MinutelyWeather, Day };
