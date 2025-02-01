import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";
import fastifyCors from "fastify-cors"; // Import fastify-cors

const start = async () => {
  // Connect to MongoDB
  await connectDB(process.env.MONGO_URI);

  // Initialize Fastify instance
  const app = Fastify();

  // Register CORS with settings
  app.register(fastifyCors, {
    origin: "*", // Allow all origins for now, but change to specific origins for production
    methods: ["GET", "POST", "PUT", "DELETE"], // Adjust methods if needed
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
    credentials: true, // Allow credentials if needed
  });

  // Register Socket.IO with CORS settings
  app.register(fastifySocketIO, {
    cors: {
      origin: "*", // Adjust origin for security in production
    },
    pingInterval: 10000,
    pingTimeout: 5000,
    transports: ["websocket"],
  });

  // Register application routes
  await registerRoutes(app);

  // Register Admin Router
  await buildAdminRouter(app);

  // Start the server
  app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
    if (err) {
      console.error(err);
    } else {
      console.log(
        `Blinkit Started on http://localhost:${PORT}${admin.options.rootPath}`
      );
    }
  });

  // Set up Socket.IO connection events
  app.ready().then(() => {
    app.io.on("connection", (socket) => {
      console.log("A User Connected ✅");

      // Handle room joining
      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log(`🔴 User Joined room ${orderId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("User Disconnected ❌");
      });
    });
  });
};

// Start the application
start();
