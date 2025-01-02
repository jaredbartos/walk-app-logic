import {
  ParsedDailyWeatherData,
  ParsedHourlyWeatherData
} from '../definitions.js';

const extractPossibleTimes = (weatherData: {
  hourly: ParsedHourlyWeatherData[];
  daily: ParsedDailyWeatherData[];
}): ParsedHourlyWeatherData[] => {
  const { daily: dailyData, hourly: hourlyData } = weatherData;

  // Get dates possible depending on maximum temperature for day
  const possibleDates = dailyData
    .filter((day) => day.temperature2mMax >= 20)
    .map((day) => day.time.getUTCDate());

  // Get all hours that fit the acceptable criteria
  const possibleHours = hourlyData.filter(
    (hour) => possibleDates.includes(hour.time.getUTCDate()) && hour.isDay === 1
  );

  // console.log('Possible Walk Hours:', possibleHours);

  return possibleHours;
};

export { extractPossibleTimes };
