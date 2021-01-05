const router = require('express').Router();
const User = require('../models/user');
const Cart = require('../models/cart')
const async = require('async')
const passport = require('passport');
const passportConf = require('../config/passport');


router.get('/login', function (req, res) {
  if (req.user) return res.redirect('/');
  res.render('accounts/login', {
    message: req.flash('loginMessage')
  });
});



// router.post('/login',
//   passport.authenticate('local-login', {
//     successRedirect: '/profile',
//     failureRedirect: '/login',
//     failureFlash: true
//   }));

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function (req, res) {
    res.redirect('/profile');
  });











router.get('/profile', passportConf.isAuthenticated, function (req, res, next) {
  User.findOne({
      _id: req.user._id
    })
    .populate('history.item')
    .exec((err, foundUser) => {
      if (err) return next(err);

      res.render('accounts/profile', {
        user: foundUser
      })
    });
})

router.get('/register', function (req, res, next) {
  res.render('accounts/register', {
    errors: req.flash('errors')
  });
});

router.post('/register', function (req, res, next) {

  async.waterfall([
    function (callback) {
      const user = new User();

      user.profile.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      user.profile.picture = user.gravatar();

      console.log(user + 'USER INPUT')
      
      User.findOne({
        email: req.body.email
      }, function (err, existingUser) {
        console.log(existingUser + 'THIS EXISTING USER')
        
        if (existingUser) {
          req.flash('errors', 'Email address already exists');
          return res.redirect('/register');
        } else {
          console.log(user + 'THIS is before save USER')
          user.save(function (err, user) {
            if (err) return next(err);
            callback(null, user);
          });
        }
      });
    },
    function (user) {
      let cart = new Cart();
      cart.owner = user._id;

      cart.save((err) => {
        if (err) return next(err);
        req.logIn(user, function (err) {
          if (err) return next(err);
          res.redirect('/profile');
        })
      })
    }
  ])


});

router.get('/logout', function (req, res, next) {
  req.session.destroy(function () {
    res.redirect('/');
  });
});

router.get('/edit-profile', function (req, res, next) {
  res.render('accounts/edit-profile', {
    message: req.flash('success')
  });
});

router.post('/edit-profile', function (req, res, next) {
  User.findOne({
    _id: req.user._id
  }, function (err, user) {

    if (err) return next(err);

    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    user.save(function (err) {
      if (err) return next(err);
      req.flash('success', 'Successfully Edited your profile');
      return res.redirect('/profile');
    });
  });
});

module.exports = router;