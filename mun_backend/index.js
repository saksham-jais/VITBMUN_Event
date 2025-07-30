import express from "express";
import morgan from "morgan";
import logger from "./libs/logger.js";
import cors from "cors";
import db from "./config/db.js";
import cookieParser from "cookie-parser";
import statusRouter from "./routes/statusRouter.js";
import committeeRouter from "./routes/committeeRoutes.js";
import countryRouter from "./routes/countryRoutes.js";
import motionRouter from "./routes/motionRoutes.js";
import gslRouter from "./routes/gslRoutes.js";
import votingRouter from "./routes/votingRouter.js";
import historyRouter from "./routes/historyRoutes.js";
import http from "http";
import { WebSocketServer } from "ws";
import { changeState } from "./utils/socketHelper.js";

const app = express();
const httpServer = http.createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
await db.sequelize.sync();

export let sharedState = {
  type: "default",
  counter: 0,
  totalCounter: 0,
};

export const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on("connection", (ws) => {
  console.log("client connected");
  ws.send(JSON.stringify({ type: "stateUpdate", state: sharedState }));
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received data from client:", data);
      if (data.action === "updateTimer") {
        sharedState.counter--;
        sharedState.totalCounter--;
        broadcast({ type: "counterUpdate", state: sharedState });
      } else if (data.action === "resetTimer") {
        sharedState.counter = sharedState.data.speakingTime;
        sharedState.totalCounter = sharedState.data.duration;
        broadcast({ type: "counterUpdate", state: sharedState });
      } else if (data.action === "selectedCountry") {
        sharedState.counter = sharedState.data.speakingTime;
        sharedState.data.selectedCountry = data.selectedCountry || null;
        console.log("Selected Country:", sharedState.data.selectedCountry);
        broadcast({ type: "selectedCountry", state: sharedState });
      } else {
        changeState(data);
      }
    } catch (e) {
      console.log(`Received a non-JSON message: ${message.toString()}`);
      console.error("Error parsing message:", e.message);
    }
  });
});

const allowedOrigins = ["*"];

// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: "GET,POST,PUT,DELETE",
//     credentials: true,
//   })
// );
app.use(cors());
app.use("/api/status/", statusRouter);
app.use("/api/committee/", committeeRouter);
app.use("/api/country/", countryRouter);
app.use("/api/motion/", motionRouter);
app.use("/api/gsl/", gslRouter);
app.use("/api/voting/", votingRouter);
app.use("/api/history/", historyRouter);

app.use((req, res, next) => {
  logger.warn(`Unhandled route: ${req.method} ${req.url}`);
  res.status(404).send("Route not found");
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGUSR2", () => shutdown("SIGUSR2"));

const PORT = 8080;
const connections = new Set();
const host = "0.0.0.0";
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`access the app at http://${host}:${PORT}`);
});

// Track all incoming connections
httpServer.on("connection", (connection) => {
  connections.add(connection);
  connection.on("close", () => {
    connections.delete(connection);
  });
});

let isShuttingDown = false;

function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}. Closing server gracefully...`);

  // 1. Close the HTTP server from accepting new connections
  httpServer.close(async () => {
    console.log("HTTP server closed.");
    // 3. Close the database connection
    await db.sequelize.close();
    console.log("Database connection closed.");
    process.exit(0);
  });

  // 2. Close all WebSocket connections
  wss.clients.forEach((ws) => ws.terminate());
  wss.close(() => {
    console.log("WebSocket server closed.");
  });

  // Forcefully close all remaining idle HTTP connections
  for (const connection of connections) {
    connection.destroy();
  }

  // Force exit after a timeout if shutdown hangs
  setTimeout(() => {
    console.error("Could not close connections in time, forcing shutdown.");
    process.exit(1);
  }, 10000); // 10-second timeout
}
