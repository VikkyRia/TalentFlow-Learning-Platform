const redis = require('redis');
require('dotenv').config();

// Use the URL from Upstash (starts with rediss://)
const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) return new Error('Redis max retries reached');
            return Math.min(retries * 50, 500);
        }
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Upstash Redis! 🚀'));

// Ensure the connection is established
(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;