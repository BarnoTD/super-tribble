const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware to parse JSON requests
app.use(express.json());



app.get('/weather', async (req, res) => {
  try {
    const { city } = req.query; // Get city from query parameters
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Call OpenWeatherMap API
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    // Extract relevant data
    const weatherData = {
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      description: response.data.weather[0].description,
      windSpeed: response.data.wind.speed,
    };

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