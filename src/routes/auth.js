import {
  fetchUser,
  loginCustomer,
  loginDeliveryPartner,
  refreshToken,
} from "../controllers/auth/auth.js";
import { updateUser } from "../controllers/tracking/user.js";
import { verifyToken } from "../middleware/auth.js";

export const authRoutes = async (fastify, options) => {
  fastify.post("/customer/login", loginCustomer); //public
  fastify.post("/delivery/login", loginDeliveryPartner); //public
  fastify.post("/refresh-token", refreshToken); //public
  fastify.get("/user", { preHandler: [verifyToken] }, fetchUser); //Logged in user ( it will pass through middleware)
  fastify.patch("/user", { preHandler: [verifyToken] }, updateUser);
};
