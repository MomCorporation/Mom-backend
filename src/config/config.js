import "dotenv/config";
import fastifySession from "@fastify/session";
import ConnectMongoDBSession from "connect-mongodb-session";
import { Admin } from "../models/index.js";

const MongoDBStore = ConnectMongoDBSession(fastifySession);

export const sessionStore = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

sessionStore.on("error", (error) => {
  console.log("Session store error", error);
});

//FOR FIRST TIME

export const authenticate = async (email, password) => {
  try {
    console.log(`Attempting login for: ${email}`); // Log email for debugging

    // Check if the email and password match the hardcoded credentials
    if (email === "admin@gmail.com" && password === "12345678") {
      console.log("Login successful!"); // Log successful login for debugging
      return Promise.resolve({ email, password });
    }

    console.log("Invalid credentials"); // Log if credentials are invalid
    return null;
  } catch (error) {
    // Catch any unexpected errors and log them
    console.error("Error during authentication:", error);
    return null;
  }
};


//AFTER CREATING ADMIN MANUALY COMMENT ABOVE AND UNCOMMENT BELOW

// export const authenticate = async (email, password) => {
//   if (email && password) {
//     const user = await Admin.findOne({ email });
//     if (!user) {
//       return null;
//     }
//     if (user.password === password) {
//       return Promise.resolve({ email: email, password: password });
//     } else {
//       return null;
//     }
//   }
//   return null;
// };

export const PORT = process.env.PORT || 3000;
export const COOKIE_PASSWORD = process.env.COOKIE_PASSWORD;
