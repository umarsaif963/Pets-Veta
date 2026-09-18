const http = require("http");

const app = require("./app");
const redisClient = require("./config/redis.config");

const { initSocket } = require("./socket/socket");

const {
  startAppointmentCleanupJob,
} = require("./jobs/appointmentCleanup.job");

const {
  startScheduleCleanupJob,
} = require("./jobs/scheduleCleanup");

const {
  startOrderCleanupJob,
} = require("./jobs/orderCleanup.job");

const port = process.env.PORT || 8000;

const httpServer = http.createServer(app);

const startServer = async () => {
  try {
    // Connect to Redis before starting the HTTP server.
    if (redisClient && !redisClient.isOpen) {
      console.log("Connecting to Redis...");
      await redisClient.connect();
    }

    // Initialize Socket.IO after Redis is ready.
    await initSocket(httpServer);

    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);

      startAppointmentCleanupJob();
      startScheduleCleanupJob();
      startOrderCleanupJob();
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();