import { fetchLocation } from './open-meteo/geocoding.js';
import { fetchForecast } from './open-meteo/forecast.js';
import { LocationPlusWeather } from './definitions.js';
import { Day } from './classes.js';

const fetchWeather = async (
  location: string
): Promise<LocationPlusWeather | undefined> => {
  try {
    const data = await fetchLocation(location);
    if (data) return await fetchForecast(data[0]);
  } catch (error) {
    console.log(error);
  }
};

const arrangeWeatherByDay = async (location: string): Promise<void> => {
  try {
    const data = await fetchWeather(location);

    if (data) {
      const { weatherData } = data;

      const daysArray: Day[] = [];
      weatherData.daily.forEach((day) => {
        const newDay = new Day(day);
        newDay.addMinutelyWeather(weatherData);
        daysArray.push(newDay);
      });

      // daysArray[0].minutely15Weather.forEach(
      //   (date) =>
      //     date.isDay &&
      //     console.log(
      //       `${date.time.getUTCHours().toString().padStart(2, '0')}:${date.time
      //         .getUTCMinutes()
      //         .toString()
      //         .padStart(2, '0')} - ${date.weatherRating}`
      //     )
      // );

      console.log(daysArray[0].minutely15Weather[32].flags);
    }
  } catch (error) {
    console.log(error);
  }
};

arrangeWeatherByDay('55025');
