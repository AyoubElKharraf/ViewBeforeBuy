import { Router } from "express";
import { env } from "../config/env.js";
import { isGoogleOAuthEnabled, passport } from "../config/passport.js";
import {
  getMeHandler,
  googleCallbackHandler,
  loginHandler,
  registerHandler,
} from "../controllers/auth.js";
import { protect } from "../shared/middlewares/auth.js";

export const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/me", protect, getMeHandler);

if (isGoogleOAuthEnabled) {
  authRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false }),
  );
  authRouter.get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${env.FRONTEND_URL}/login?error=oauth`,
    }),
    googleCallbackHandler,
  );
}
