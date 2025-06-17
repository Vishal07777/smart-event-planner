const axios = require('axios');
const API_KEY = process.env.OPENWEATHER_API_KEY;

const getWeather = async (location) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`;
  const response = await axios.get(url);
  return response.data;
};

const calculateSuitability = (forecast, eventType) => {
  const temp = forecast.main.temp;
  const wind = forecast.wind.speed;
  const precipitation = forecast.pop || 0;
  const condition = forecast.weather[0].main;

  let score = 0;

  if (eventType === "cricket") {
    if (temp >= 15 && temp <= 30) score += 30;
    if (precipitation < 0.2) score += 25;
    if (wind < 20) score += 20;
    if (["Clear", "Clouds"].includes(condition)) score += 25;
  }

  if (eventType === "wedding") {
    if (temp >= 18 && temp <= 28) score += 30;
    if (precipitation < 0.1) score += 30;
    if (wind < 15) score += 25;
    if (["Clear", "Partly Cloudy"].includes(condition)) score += 15;
  }

  if (score >= 90) return "Good";
  else if (score >= 60) return "Okay";
  else return "Poor";
};

module.exports = { getWeather, calculateSuitability };
