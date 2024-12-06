import { fetchCoordinates } from './open-meteo/geocoding.js';
import { fetchWeatherForecast } from './open-meteo/forecast.js';

const getWeather = async (zip: number): Promise<void> => {
  const coordinates = await fetchCoordinates(String(zip));

  if (coordinates) {
    await fetchWeatherForecast(coordinates);
  } else {
    console.log('Failed fetching coordinates from zip');
  }
};

getWeather(55025);