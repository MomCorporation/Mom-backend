import AdminJS from "adminjs";
import AdminJSFastify from "@adminjs/fastify";
import * as AdminJSMongoose from "@adminjs/mongoose";
import * as Models from "../models/index.js";
import { authenticate, COOKIE_PASSWORD, sessionStore } from "./config.js";
import { dark, light, noSidebar } from "@adminjs/themes";

// Register Mongoose adapter for AdminJS
AdminJS.registerAdapter(AdminJSMongoose);

// AdminJS setup with resources
export const admin = new AdminJS({
  resources: [
    {
      resource: Models.Customer,
      options: {
        listProperties: ["phone", "role", "isActivated"],
        filterProperties: ["phone", "role"],
      },
    },
    {
      resource: Models.DeliveryPartner,
      options: {
        listProperties: ["email", "role", "isActivated"],
        filterProperties: ["email", "role"],
      },
    },
    {
      resource: Models.Admin,
      options: {
        listProperties: ["email", "role", "isActivated"],
        filterProperties: ["email", "role"],
      },
    },
    { resource: Models.Branch },
    { resource: Models.Product },
    { resource: Models.Category },
    { resource: Models.Order },
    { resource: Models.Counter },
    { resource: Models.Address },
  ],

  // Branding settings for the AdminJS panel
  branding: {
    companyName: "MOM",
    withMadeWithLove: false,
    favicon: "https://res.cloudinary.com/dponzgerb/image/upload/v1722852076/s32qztc3slzqukdletgj.png",
    logo: "https://res.cloudinary.com/dponzgerb/image/upload/v1722852076/s32qztc3slzqukdletgj.png",
  },
  defaultTheme: dark.id,
  availableThemes: [dark, light, noSidebar],
  rootPath: "/admin",  // The root URL path for AdminJS
});

// Build the authenticated router using Fastify
export const buildAdminRouter = async (app) => {
  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate,               // Function to authenticate users
      cookiePassword: COOKIE_PASSWORD,
      cookieName: "adminjs",       // Cookie name for admin session
    },
    app,
    {
      store: sessionStore,         // MongoDB session store
      saveUninitialized: true,     // Ensure session is saved even if not modified
      secret: COOKIE_PASSWORD,     // Secret used for signing the session cookie
      cookie: {
        httpOnly: true,            // Ensures cookies cannot be accessed via JavaScript
        secure: process.env.NODE_ENV === "production",  // Ensures cookies are only sent over HTTPS in production
        maxAge: 24 * 60 * 60 * 1000,  // Set session expiration (1 day)
      },
    }
  );
};
