import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateOAuthUser } from "../services/auth.js";
import { logger } from "../shared/logger.js";
import { env } from "./env.js";

export const isGoogleOAuthEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

if (isGoogleOAuthEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID as string,
        clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const result = await findOrCreateOAuthUser({
            provider: "google",
            providerId: profile.id,
            email: profile.emails?.[0]?.value ?? "",
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          });
          // On transporte { user, token } via req.user jusqu'au callback
          done(null, result as unknown as Express.User);
        } catch (err) {
          done(err as Error);
        }
      },
    ),
  );
  logger.info("Google OAuth2 activé");
} else {
  logger.info("Google OAuth2 désactivé (GOOGLE_CLIENT_ID/SECRET manquants)");
}

export { passport };
