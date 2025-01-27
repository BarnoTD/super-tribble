require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;


const API_KEY = process.env.OPENWEATHERMAP_API_KEY; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Endpoint to fetch weather data
app.get('/weather', async (req, res) => {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ error: 'City parameter is required' });
    }

    try {
        const response = await axios.get(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const weatherData = {
            city: response.data.name,
            temperature: response.data.main.temp,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
            description: response.data.weather[0].description,
        };
        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Weather Service running on http://localhost:${PORT}`);
});