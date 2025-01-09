import { fetchCoordinates } from './open-meteo/geocoding.js';
import { fetchWeatherForecast } from './open-meteo/forecast.js';
import { extractPossibleTimes } from './utils/filters.js';
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
    const possibleHours = extractPossibleTimes(weatherData);

    console.log('Hourly Weather:', possibleHours[0]);

    console.log('Weather Rating:', getWeatherRating(possibleHours[0]));
  }
};

getBestWalkTimes('55025');
