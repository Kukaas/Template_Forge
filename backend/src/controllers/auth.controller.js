import passport from 'passport';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/user.model.js';

export const loginSuccess = (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: req.user
    });
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
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error logging out" });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
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
  scope: ['user:email'] 
});

export const githubCallback = (req, res, next) => {
  passport.authenticate('github', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    });
  })(req, res, next);
};

export const handleAuthCallback = async (provider, profile) => {
  try {
    let user = await UserModel.findByProviderId(provider, profile.id);

    if (!user) {
      const userData = {
        id: uuidv4(),
        email: profile.emails[0].value,
        name: profile.displayName || profile.username,
        avatar: profile.photos?.[0]?.value || null,
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