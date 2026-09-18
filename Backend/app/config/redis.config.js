const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL;

let redisClient = null;

if (redisUrl) {
    redisClient = createClient({
        url: redisUrl,
        socket: {
            reconnectStrategy: false,
        },
    });

    redisClient.on("connect", () => {
        console.log("Redis Connected");
    });

    redisClient.on("ready", () => {
        console.log("Redis Ready");
    });

    redisClient.on("error", (err) => {
        console.error("Redis Connection Error:", err.message);
    });
} else {
    console.warn("REDIS_URL not set. Using in-memory rate limiting.");
}

// The TypeScript RAG cache reuses this process-wide connection.
globalThis.__petsVetaRedisClient = redisClient;

module.exports = redisClient;