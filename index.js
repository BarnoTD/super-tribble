const { saveWeatherData } = require('./db');
const { connect, sendAlert } = require("./rabbitmq");
const express = require("express");
const axios = require("axios");
require("dotenv").config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
connect();

app.use(cors());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware to parse JSON requests
app.use(express.json());

app.get("/weather", async (req, res) => {
  try {
    const { city } = req.query; // Get city from query parameters
    if (!city) {
      return res.status(400).json({ error: "City parameter is required" });
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
      conditionId: response.data.weather[0].id
    };

    try {
      await saveWeatherData(city, weatherData);
      console.log('Weather data saved to database');
    } catch (err) {
      console.error('Failed to save to DB:', err);
    }

    // Check for severe weather (example: wind speed > 15 m/s)
    if (weatherData.windSpeed > 8) {
      const alert = {
        to: "+21694434003", // Replace with user's phone number (hardcoded for now)
        message: `Severe weather alert in ${city}: High winds (${weatherData.windSpeed} m/s)!`,
      };
      sendAlert(alert); // Send to RabbitMQ
    }

    res.json(weatherData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Weather service listening on port ${port}`);
});
