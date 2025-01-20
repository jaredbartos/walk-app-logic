import { fetchCoordinates } from './open-meteo/geocoding.js';
import { fetchWeatherForecast } from './open-meteo/forecast.js';
import { LocationData } from './definitions.js';
import { getWeatherRating } from './utils/weather-rating.js';

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
    const daylightHours = weatherData.hourly.filter((hour) => hour.isDay === 1);

    console.log('Hourly Weather:', daylightHours[0]);

    getWeatherRating(daylightHours[0]);
  }
};

getBestWalkTimes('55025');
