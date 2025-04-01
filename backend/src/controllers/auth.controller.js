import passport from 'passport';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/user.model.js';

export const loginSuccess = async (req, res) => {
  if (req.user) {
    try {
      const isPremium = await UserModel.isUserPremium(req.user.id);
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          ...req.user,
          isPremium
        }
      });
    } catch (error) {
      console.error('Error checking premium status:', error);
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          ...req.user,
          isPremium: false
        }
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }
};

export const loginFailed = (req, res) => {
  res.status(401).json({
    success: false,
    message: "Login failed"
  });
};

export const logout = (req, res) => {
  // Get the user's provider before logging out
  const provider = req.user?.provider;
  const accessToken = req.user?.accessToken;

  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error logging out" });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }

      // If it was a GitHub login, revoke the token
      if (provider === 'github' && accessToken) {
        fetch('https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/token', {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`).toString('base64')}`,
          },
          body: JSON.stringify({ access_token: accessToken })
        }).catch(error => console.error('Error revoking GitHub token:', error));
      }

      res.redirect(process.env.CLIENT_URL);
    });
  });
};

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
});

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return next(err);
    }

    if (!user) {
      console.log('Authentication failed: No user');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      console.log('User logged in successfully');

      // Send success message and close popup
      res.send(`
        <script>
          window.opener.postMessage({ type: 'AUTH_SUCCESS' }, '${process.env.CLIENT_URL}');
          window.close();
        </script>
      `);
    });
  })(req, res, next);
};

export const githubAuth = passport.authenticate('github', {
  scope: ['user:email'],
  prompt: 'consent',
  access_type: 'offline',
  response_type: 'code',
  approval_prompt: 'force'
});

export const githubCallback = (req, res, next) => {
  passport.authenticate('github', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return next(err);
    }

    if (!user) {
      console.log('Authentication failed: No user');
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      console.log('User logged in successfully');

      // Send success message and close popup
      res.send(`
        <script>
          window.opener.postMessage({ type: 'AUTH_SUCCESS' }, '${process.env.CLIENT_URL}');
          window.close();
        </script>
      `);
    });
  })(req, res, next);
};

export const handleAuthCallback = async (provider, profile) => {
  try {
    let user = await UserModel.findByProviderId(provider, profile.id);

    if (!user) {
      // Handle email differently for GitHub and Google
      let email;
      if (provider === 'github') {
        // GitHub might not provide email in the same structure
        email = profile.emails ? profile.emails[0].value : profile._json.email;
      } else {
        // Google email handling
        email = profile.emails[0].value;
      }

      if (!email) {
        throw new Error('No email provided from OAuth provider');
      }

      const userData = {
        id: uuidv4(),
        email: email,
        name: profile.displayName || profile.username || profile._json.name,
        avatar: profile.photos?.[0]?.value || profile._json.avatar_url || null,
        provider: provider,
        provider_id: profile.id
      };

      await UserModel.create(userData);
      user = await UserModel.findByProviderId(provider, profile.id);
    }

    return user;
  } catch (error) {
    console.error('Error in auth callback:', error);
    throw error;
  }
};

export const serializeUser = (user, done) => {
  done(null, user.id);
};

export const deserializeUser = async (id, done) => {
  try {
    const rows = await UserModel.findById(id);
    done(null, rows[0] || null);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
};

export const checkPremiumStatus = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
      isPremium: false
    });
  }

  try {
    const isPremium = await UserModel.isUserPremium(req.user.id);
    res.status(200).json({
      success: true,
      isPremium
    });
  } catch (error) {
    console.error('Error checking premium status:', error);
    res.status(500).json({
      success: false,
      message: "Error checking premium status",
      isPremium: false
    });
  }
};