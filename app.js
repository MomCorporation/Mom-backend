import "dotenv/config";
import Fastify from "fastify";
import { connectDB } from "./src/config/connect.js";
import { PORT } from "./src/config/config.js";
import { admin, buildAdminRouter } from "./src/config/setup.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";
import fastifyCors from "fastify-cors"; // Import fastify-cors

const start = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await connectDB(process.env.MONGO_URI);
    console.log("DB CONNECTED ✔");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process if DB connection fails
  }

  let app;
  try {
    // Initialize Fastify instance
    console.log("Initializing Fastify app...");
    app = Fastify();
    console.log("Fastify app initialized successfully.");
  } catch (error) {
    console.error("Error initializing Fastify app:", error);
    process.exit(1); // Exit process if Fastify initialization fails
  }

  try {
    // Register CORS with settings
    console.log("Registering CORS settings...");
    app.register(fastifyCors, {
      origin: "*", // Allow all origins for now, but change to specific origins for production
      methods: ["GET", "POST", "PUT", "DELETE"], // Adjust methods if needed
      allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
      credentials: true, // Allow credentials if needed
    });
    console.log("CORS settings registered successfully.");
  } catch (error) {
    console.error("Error registering CORS:", error);
    process.exit(1); // Exit process if CORS registration fails
  }

  try {
    // Register Socket.IO with CORS settings
    console.log("Registering Socket.IO...");
    app.register(fastifySocketIO, {
      cors: {
        origin: "*", // Adjust origin for security in production
      },
      pingInterval: 10000,
      pingTimeout: 5000,
      transports: ["websocket"],
    });
    console.log("Socket.IO registered successfully.");
  } catch (error) {
    console.error("Error registering Socket.IO:", error);
    process.exit(1); // Exit process if Socket.IO registration fails
  }

  try {
    // Register application routes
    console.log("Registering application routes...");
    await registerRoutes(app);
    console.log("Routes registered successfully.");
  } catch (error) {
    console.error("Error registering routes:", error);
    process.exit(1); // Exit process if route registration fails
  }

  try {
    // Register Admin Router
    console.log("Building AdminJS router...");
    await buildAdminRouter(app);
    console.log("AdminJS router built successfully.");
  } catch (error) {
    console.error("Error building AdminJS router:", error);
    process.exit(1); // Exit process if AdminJS router build fails
  }

  try {
    // Start the server
    console.log(`Starting server on port ${PORT}...`);
    app.listen({ port: PORT, host: "0.0.0.0" }, (err, addr) => {
      if (err) {
        console.error("Error starting server:", err);
        process.exit(1); // Exit process if server fails to start
      } else {
        console.log(
          `Blinkit Started on ${addr}${admin.options.rootPath}`
        );
      }
    });
  } catch (error) {
    console.error("Error during server startup:", error);
    process.exit(1); // Exit process if server startup fails
  }

  try {
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
  } catch (error) {
    console.error("Error setting up Socket.IO events:", error);
    process.exit(1); // Exit process if Socket.IO events setup fails
  }
};

// Start the application
start();
