const getAbsoluteHumidity = (tempF: number, relativeHumidity: number) => {
  // Absolute Humidity (grams/m^3) = 6.112 × e^[(17.67 × T)/(T+243.5)] × rh × 2.1674 / (273.15+T)

  // Get temperature in Celcius
  const tempC = ((tempF - 32) * 5) / 9;
  const exponent = (17.67 * tempC) / (tempC + 243.5);

  // Return absolute humidity in grams/m^3
  return (
    (6.112 * Math.pow(Math.E, exponent) * relativeHumidity * 2.1674) /
    (273.15 + tempC)
  );
};

export { getAbsoluteHumidity };
