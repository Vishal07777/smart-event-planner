const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { getWeather, calculateSuitability } = require('../services/weatherService');

// Create event
router.post('/', async (req, res) => {
  const { name, location, date, eventType } = req.body;

  try {
    const weatherData = await getWeather(location);
    const forecast = weatherData.list.find(item => item.dt_txt.startsWith(date));

    if (!forecast) {
      const availableDates = [...new Set(weatherData.list.map(f => f.dt_txt.split(' ')[0]))];
      return res.status(404).json({
        message: "No weather data for that date. Try one of these instead.",
        availableDates
      });
    }

    const suitability = calculateSuitability(forecast, eventType);

    const event = new Event({ name, location, date, eventType, weather: forecast, suitability });
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weather for specific location/date
router.get('/weather/:location/:date', async (req, res) => {
  const { location, date } = req.params;

  try {
    const weatherData = await getWeather(location);
    const matches = weatherData.list.filter(item => item.dt_txt.startsWith(date));

    if (matches.length === 0) {
      const availableDates = [...new Set(weatherData.list.map(f => f.dt_txt.split(' ')[0]))];
      return res.status(404).json({
        message: "No weather data for that date. Try one of these instead.",
        availableDates
      });
    }

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alternative suggestions for better weather
router.get('/:id/alternatives', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    const weatherData = await getWeather(event.location);

    const suggestions = [];

    weatherData.list.forEach(forecast => {
      const date = forecast.dt_txt.split(" ")[0];
      const suitability = calculateSuitability(forecast, event.eventType);
      if (suitability === "Good") {
        suggestions.push({
          date: forecast.dt_txt,
          suitability,
          weather: forecast.weather[0].description
        });
      }
    });

    if (suggestions.length === 0) {
      return res.json({ message: "No better alternatives found in forecast window." });
    }

    res.json({ alternatives: suggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
