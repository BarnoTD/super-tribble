const amqp = require('amqplib');

let channel = null;

// Connect to RabbitMQ and create a channel
async function connect() {
  const connection = await amqp.connect('amqp://localhost:5672');
  channel = await connection.createChannel();
  await channel.assertQueue('weather-alerts'); // Create a queue named "weather-alerts"
  console.log('Connected to RabbitMQ');
}

// Send a message to the queue
function sendAlert(alert) {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  channel.sendToQueue('weather-alerts', Buffer.from(JSON.stringify(alert)));
  console.log('Alert sent to queue:', alert);
}

module.exports = { connect, sendAlert };