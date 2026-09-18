require("dotenv").config();

const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => {
  console.error("Redis error:", err.message);
});

async function test() {
  try {
    console.log("Connecting to Redis...");

    await client.connect();

    console.log("Connected!");

    await client.set("pets-veta-test", "hello");

    const value = await client.get("pets-veta-test");

    console.log("Redis value:", value);

    await client.del("pets-veta-test");

    await client.quit();

    console.log("Redis test successful!");
  } catch (error) {
    console.error("Redis test failed:", error.message);
    process.exit(1);
  }
}

test();