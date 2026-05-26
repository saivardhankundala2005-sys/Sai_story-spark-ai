import express from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middleware/validate.request";
import { UserValidator } from "../user/user.validation";
import ipRateLimiter from "../../middleware/ip.rate-limiter";
const router = express.Router();

// Login API route
router.post(
  "/login",
  validateRequest(UserValidator.login),
  AuthController.login
);

// Google Login API route
router.post("/google-login", AuthController.googleLogin);

// Register API route
router.post(
  "/register",
  ipRateLimiter,
  validateRequest(UserValidator.register),
  AuthController.register
);

// Refresh Token API route
router.post("/refresh-token", AuthController.refreshToken);

export const AuthRouter = router;
