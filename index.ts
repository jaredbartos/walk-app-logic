import { fetchCoordinates } from './open-meteo/geocoding.js';
import { fetchForecast } from './open-meteo/forecast.js';
import { LocationData } from './definitions.js';
import { Day } from './classes.js';

const fetchWeather = async (
  location: string
): Promise<LocationData | undefined> => {
  try {
    const coordinates = await fetchCoordinates(location);
    if (coordinates) return await fetchForecast(coordinates);
  } catch (error) {
    console.log(error);
  }
};

const arrangeWeatherByDay = async (location: string): Promise<void> => {
  try {
    const data = await fetchWeather(location);

    if (data) {
      const {
        timezone,
        timezoneAbbreviation,
        latitude,
        longitude,
        name,
        admin1,
        country,
        weatherData
      } = data;

      const daysArray: Day[] = [];
      weatherData.daily.forEach((day) => {
        const newDay = new Day(day);
        newDay.addHourlyWeather(weatherData.hourly);
        daysArray.push(newDay);
      });

      // daysArray[0].hourlyWeather.forEach(
      //   (hour) =>
      //     hour.isDay &&
      //     console.log(`${hour.time.getUTCHours()} - ${hour.weatherRating}`)
      // );
    }
  } catch (error) {
    console.log(error);
  }
};

arrangeWeatherByDay('55025');
