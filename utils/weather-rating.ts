import { ParsedHourlyWeatherData } from '../definitions.js';
import { getAbsoluteHumidity } from './absolute-humidity.js';

const getBaseLog = (x: number, y: number) => {
  return Math.log(y) / Math.log(x);
};

const minZero = (num: number) => {
  if (num < 0) {
    return 0;
  }

  return num;
};

// Calculate weather rating
const getWeatherRating = (
  data: ParsedHourlyWeatherData,
  idealTemp = 70
): number => {
  const uvIndexScore = Math.abs(data.uvIndex * 10 - 100);
  const precipitationProbabilityScore = Math.abs(
    data.precipitationProbability - 100
  );
  const visibilityScore =
    data.visibility >= 50000 ? 100 : data.visibility * (100 / 50000);

  // Calculate difference between apparent temperature and ideal apparent temperature
  const apparentTemperatureDifference = Math.abs(
    data.apparentTemperature - idealTemp
  );
  const apparentTemperatureScore = minZero(
    data.apparentTemperature >= idealTemp
      ? 100 - apparentTemperatureDifference ** getBaseLog(100 - idealTemp, 100)
      : 100 - apparentTemperatureDifference ** getBaseLog(idealTemp - 20, 100)
  );

  /* Cloud cover difference and shade score used for when temperature is hot
  and additional shade is optimal */
  const cloudCoverDifference = Math.abs(data.cloudCover - 35);
  const shadeScore =
    data.cloudCover > 35
      ? 100 - cloudCoverDifference * 1.53
      : 100 - cloudCoverDifference * 2.85;
  const cloudCoverScore =
    data.apparentTemperature < 80
      ? Math.abs(data.cloudCover - 100)
      : shadeScore;

  // Wind speed difference used for when temperatures are high and slight breeze is helpful
  const windSpeed10mDifference = Math.abs(data.windSpeed10m - 5);
  const windSpeed10mScore = minZero(
    data.apparentTemperature >= 80
      ? 100 - windSpeed10mDifference ** getBaseLog(20, 100)
      : 100 - data.windSpeed10m ** getBaseLog(20, 100)
  );

  const windGusts10mDifference = Math.abs(data.windGusts10m - 5);
  const windGusts10mScore = minZero(
    data.apparentTemperature >= 80
      ? 100 - windGusts10mDifference ** getBaseLog(30, 100)
      : 100 - data.windGusts10m ** getBaseLog(30, 100)
  );

  // Ideal absolute humidity - 8 g/m^3
  const absoluteHumidity = getAbsoluteHumidity(
    data.temperature2m,
    data.relativeHumidity2m
  );
  // Difference from ideal absolute humidity
  const absoluteHumidityDifference = Math.abs(absoluteHumidity - 8);

  const airMoistureScore = minZero(
    absoluteHumidity >= 8
      ? 100 - absoluteHumidityDifference ** getBaseLog(10, 100)
      : 100 - absoluteHumidityDifference ** getBaseLog(8, 100)
  );

  /*
  ** Weighting **
  apparentTemperature: 30%
  uvIndex: 25%
  precipitationProbability: 15%
  visibility: 5%
  cloudCover: 10%
  windSpeed10m: 5%
  airMoisture: 5%
  windGusts10m: 5%
  */

  let weatherRating =
    apparentTemperatureScore * 0.35 +
    uvIndexScore * 0.2 +
    precipitationProbabilityScore * 0.15 +
    visibilityScore * 0.05 +
    cloudCoverScore * 0.1 +
    windSpeed10mScore * 0.05 +
    airMoistureScore * 0.05 +
    windGusts10mScore * 0.05;

  // Create convenient 0 to 100 scale
  weatherRating = minZero((weatherRating / 40 - 1) * (100 / 1.5));

  console.log(`Temperature Score: ${apparentTemperatureScore}
UV Index Score: ${uvIndexScore}
Precipitation Probability Score: ${precipitationProbabilityScore}
Visibility Score: ${visibilityScore}
Cloud Cover Score: ${cloudCoverScore}
Wind Speed Score: ${windSpeed10mScore}
Wind Gusts Score: ${windGusts10mScore}
Air Moisture Score: ${airMoistureScore}
WEATHER RATING: ${weatherRating}`);

  return weatherRating;
};

export { getWeatherRating };
