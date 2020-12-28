const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

// serialize and deserialize
passport.serializeUser((user, done) => { 
  done(null, user.id)
})

passport.deserializeUser((id, done) => { 
  User.findById(id, (err, user) => { 
    done(err, user)
  })
})

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
},
  function (req, email, password, done) {
    User.findOne({
      email: email
    }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, req.flash('loginMessage', 'No user has been found'));
      }
      if (!user.comparePassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Try again'));
      }
      return done(null, user);
    });
  }
));

exports.isAuthenticated = function () { 
  if (req.isAuthenticated()) { 
    return next();
  }
  res.redirect('/login')
}



