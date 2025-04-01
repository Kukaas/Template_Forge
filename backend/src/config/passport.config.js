import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';

const initializePassport = (handleAuthCallback, serializeUser, deserializeUser) => {
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);

  // Check for required environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('Warning: Google OAuth credentials not found in environment variables');
    return;
  }

  // Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleAuthCallback('google', profile);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Check GitHub credentials before initializing GitHub strategy
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.warn('Warning: GitHub OAuth credentials not found in environment variables');
    return;
  }

  // GitHub Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await handleAuthCallback('github', profile);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }));
};

export default initializePassport;