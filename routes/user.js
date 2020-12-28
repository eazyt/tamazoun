const router = require('express').Router();
const User = require('../models/user')
// const mongoose = require('mongoose')
const passport = require('passport')
const passportConf = require('../config/passport')

router.get('/login', (req, res) => { 
  if (req.user) return res.redirect('/')
  res.render('accounts/login', {
    message: req.flash('loginMessage') 
  })
})

router.post('/login',
  passport.authenticate('local', {
    // successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }),
  function (req, res) {
    res.redirect('/profile');
  });

router.get('/profile', (req, res, next) => { 
  // res.send('Welcome to your Dashboard' + req.user)
  User.findOne({ _id: req.user.id }, (err, user) => { 
    if(err) throw next(err)
    res.render('accounts/profile', {
      user: user
    })
  })
})

router.get('/register', (req, res) => { 
  res.render('accounts/register', {
    errors: req.flash('errors')
  })
})

router.post('/register', (req, res, next) => {
  const user = new User();

  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;
  user.profile.picture = user.gravatar();

  User.findOne({ email: req.body.email }, (err, userExists) => {
    if (userExists) {
      req.flash('errors', 'Email already exists')
      return res.redirect('/register')
    } else {
      user.save((err, user) => {
        if (err) return next(err);
      //  return res.redirect('/')
        req.logIn(user, (err)=> { 
          if (err) return next(err);
          res.redirect('/profile');
        })
      })
    }
  })
})

router.get('/logout', (req, res, next) => {
  // req.logout();
  // res.redirect('/')
  // next()
  req.session.destroy(function () {
    res.redirect('/');
  })
})


  
module.exports = router;