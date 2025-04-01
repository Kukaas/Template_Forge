import passport from 'passport';

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
  req.logout();
  res.redirect(process.env.CLIENT_URL);
};

export const googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});

export const googleCallback = passport.authenticate('google', {
  successRedirect: process.env.CLIENT_URL,
  failureRedirect: '/login/failed'
});

export const githubAuth = passport.authenticate('github', { 
  scope: ['user:email'] 
});

export const githubCallback = passport.authenticate('github', {
  successRedirect: process.env.CLIENT_URL,
  failureRedirect: '/login/failed'
}); 