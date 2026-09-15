const redisClient = require('../config/redis.config');
const { RedisStore } = require('rate-limit-redis');
const { rateLimit } = require('express-rate-limit');

const createRedisStore = (prefix) => {
    if (!redisClient) {
        return undefined;
    }

    return new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix,
    });
}


const authLimiter = rateLimit({
    store: createRedisStore('rl:auth:'),
    windowMs: 5 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        status: 429,
        error: "To many Auth attempts"
    }
});

const adminLimiter = rateLimit({
    store: createRedisStore('rl:admin:'),
    windowMs: 10 * 60 * 1000,
    limit: 50,
    standardHeaders: false,
    message: {
        status: 429,
        error: "Admin resource limit reaached try again after some minutes"
    }
})

// Refresh tokens are renewed on every app load and periodically during a
// session, so they need a much more generous budget than signup/login or the
// client can end up rate-limited (429) and logged out for no reason.
const refreshLimiter = rateLimit({
    store: createRedisStore('rl:refresh:'),
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Too many refresh attempts. Please try again shortly."
    }
});

const petOwnerLimiter = rateLimit({
    store: createRedisStore('rl:petOwner:'),
    windowMs: 10 * 60 * 1000,
    limit: 50,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Resource limite Reach Wait for few second"
    }
});

const globalUserLimiter = rateLimit({
    store: createRedisStore('rl:global:'),
    windowMs: 10 * 60 * 1000,
    limit: 150,
    legacyHeaders: false,
    standardHeaders: 'draft-8',
    message: {
        status: 429,
        error: "Too many request from this device Please slow down"
    }
});

const doctorLimiter = rateLimit({
    limit: 100,
    windowMs: 10 * 60 * 1000,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        status: 429,
        error: "Too many requests Please wait a minute only then proceed"
    }
})

module.exports = {
    adminLimiter,
    globalUserLimiter,
    authLimiter,
    petOwnerLimiter,
    doctorLimiter,
    refreshLimiter
}
