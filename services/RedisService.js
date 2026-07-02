const { redisClient, connectRedis } = require('../utils/redisClient.js');

const set = async (key, value, expirySeconds = 300) => {
    await connectRedis();

    await redisClient.setEx(
        key,
        expirySeconds,
        JSON.stringify(value)
    );

    return true;
};

const get = async (key) => {
    await connectRedis();

    const data = await redisClient.get(key);

    if (!data) {
        return null;
    }

    return JSON.parse(data);
};

const remove = async (key) => {
    await connectRedis();

    return await redisClient.del(key);
};

const exists = async (key) => {
    await connectRedis();

    return await redisClient.exists(key);
};

const ttl = async (key) => {
    await connectRedis();

    return await redisClient.ttl(key);
};

const update = async (
    key,
    value,
    expirySeconds = null
) => {
    await connectRedis();

    const currentTtl =
        expirySeconds ??
        await redisClient.ttl(key);

    await redisClient.setEx(
        key,
        currentTtl > 0 ? currentTtl : 300,
        JSON.stringify(value)
    );

    return true;
};

module.exports = {
    set,
    get,
    remove,
    exists,
    ttl,
    update
};