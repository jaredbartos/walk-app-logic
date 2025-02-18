import axios from 'axios';
import { Location } from '../definitions.js';

// Fetch coordinates via geocoding API
const fetchLocation = async (name: string): Promise<Location[] | undefined> => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${name}&count=10&language=en&format=json`;

  try {
    const response = await axios.get(url);

    return response.data.results;
  } catch (error) {
    console.error(error);
  }
};

export { fetchLocation };
