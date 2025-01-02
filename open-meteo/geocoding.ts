import axios from 'axios';
import { Coordinates } from '../definitions.js';

// Fetch coordinates via geocoding API
const fetchCoordinates = async (
  name: string
): Promise<Coordinates | undefined> => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${name}&count=10&language=en&format=json`;

  try {
    const response = await axios.get(url);
    const { latitude, longitude, name, admin1, country } =
      response.data.results[0];

    return { name, admin1, country, latitude, longitude };
  } catch (error) {
    console.error(error);
  }
};

export { fetchCoordinates };
