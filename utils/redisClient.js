const redis = require('redis');

const redisClient = redis.createClient(); 

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect(); 
        console.log('✅Redis client connected');
    }
};

module.exports = { redisClient, connectRedis };