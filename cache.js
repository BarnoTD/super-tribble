const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

// Handle connection events
client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Connect to Redis
client.connect();

async function getFromCache(key) {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis get error:', err);
    return null;
  }
}

async function setInCache(key, value, ttl = 3600) {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error('Redis set error:', err);
  }
}

module.exports = { getFromCache, setInCache };