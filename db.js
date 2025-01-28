const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function saveWeatherData(city, data) {
  const query = `
    INSERT INTO weather_history 
      (city, temperature, humidity, wind_speed, condition_id)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await pool.query(query, [
    city,
    data.temperature,
    data.humidity,
    data.windSpeed,
    data.conditionId
  ]);
}

module.exports = { saveWeatherData };