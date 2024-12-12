import { fetchCoordinates } from './open-meteo/geocoding.js';
import { fetchWeatherForecast } from './open-meteo/forecast.js';

const getWeather = async (zip: number): Promise<void> => {
  const coordinates = await fetchCoordinates(String(zip));
  let data;

  if (coordinates) {
    data = await fetchWeatherForecast(coordinates);
  } else {
    console.log('Failed fetching coordinates from zip');
  }

  console.log(data);
};

getWeather(55025);
