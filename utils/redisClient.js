const redis = require('redis');

const redisClient = redis.createClient(); // This creates the client

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect(); // You MUST connect before using
        console.log('✅Redis client connected');
    }
};

module.exports = { redisClient, connectRedis };