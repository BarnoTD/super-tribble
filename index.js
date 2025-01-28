const { getFromCache, setInCache } = require('./cache');
const { saveWeatherData } = require('./db');
const { connect, sendAlert } = require("./rabbitmq");
const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
connect();

// Graceful shutdown
process.on('SIGINT', () => {
  client.quit();
  console.log('Redis client disconnected');
  process.exit();
});

process.on('SIGTERM', () => {
  client.quit();
  console.log('Redis client disconnected');
  process.exit();
});

app.use(cors());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware to parse JSON requests
app.use(express.json());

app.get('/weather', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  try {
    // Check cache first
    const cachedData = await getFromCache(city);
    if (cachedData) {
      console.log('Serving from cache');
      return res.json(cachedData);
    }

    // Fetch from OpenWeatherMap API
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    const weatherData = {
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      windSpeed: response.data.wind.speed,
      conditionId: response.data.weather[0].id,
    };

    // Save to cache
    await setInCache(city, weatherData);

    // Save to database
    await saveWeatherData(city, weatherData);

    res.json(weatherData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Weather service listening on port ${port}`);
});
