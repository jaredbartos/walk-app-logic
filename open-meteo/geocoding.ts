import axios from 'axios';

const fetchCoordinates = async (
  name: string
): Promise<{ lat: number; lon: number } | null> => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${name}&count=10&language=en&format=json`;

  try {
    const response = await axios.get(url);
    const { latitude: lat, longitude: lon } = response.data.results[0];

    return { lat, lon };
  } catch (error) {
    console.error(error);
  }

  return null;
};

export { fetchCoordinates };
