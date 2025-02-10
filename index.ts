import { fetchCoordinates } from './open-meteo/geocoding.js';
import { fetchWeatherForecast } from './open-meteo/forecast.js';
import { LocationData } from './definitions.js';
import { Day } from './classes.js';

const getWeather = async (
  location: string
): Promise<LocationData | undefined> => {
  try {
    const coordinates = await fetchCoordinates(location);
    if (coordinates) return await fetchWeatherForecast(coordinates);
  } catch (error) {
    console.log(error);
  }
};

const getBestWalkTimes = async (location: string): Promise<void> => {
  const data = await getWeather(location);

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

    daysArray[0].hourlyWeather.forEach(
      (hour) =>
        hour.isDay &&
        console.log(`${hour.time.getUTCHours()} - ${hour.weatherRating}`)
    );

    console.log(daysArray[0].hourlyWeather[13].flags);
  }
};

getBestWalkTimes('55025');
