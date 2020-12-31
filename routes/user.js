var router = require('express').Router();
var User = require('../models/user');
const Cart = require('../models/cart')
const async = require('async')
var passport = require('passport');
var passportConf = require('../config/passport');


router.get('/login', function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('accounts/login', {
    message: req.flash('loginMessage')
  });
});

router.post('/login',
  passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/profile', function(req, res, next) {
  User.findOne({ _id: req.user._id }, function(err, user) {
    if (err) return next(err);

    res.render('accounts/profile', {
      user: user
    });

  });


});

router.get('/register', function(req, res, next) {
  res.render('accounts/register', {
    errors: req.flash('errors')
  });
});

router.post('/register', function (req, res, next) {
  
  async.waterfall([
    function (callback) { 
        let user = new User();

        user.profile.name = req.body.name;
        user.email = req.body.email;
        user.password = req.body.password;
        user.profile.picture = user.gravatar();

        User.findOne({
          email: req.body.email
        }, function (err, existingUser) {

          if (existingUser) {
            req.flash('errors', 'Email address already exists');
            return res.redirect('/register');
          } else {
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

// router.post('/register', function (req, res, next) {
//   var user = new User();

//   user.profile.name = req.body.name;
//   user.email = req.body.email;
//   user.password = req.body.password;
//   user.profile.picture = user.gravatar();
//   // console.log(user)
  
//   User.findOne({ email: req.body.email }, function(err, existingUser) {
//     // console.log(existingUser)
    
//     if (existingUser) {
//       req.flash('errors', 'Account with that email address already exists');
//       return res.redirect('/register');
//     } else {
//       // console.log("save pass")
//       // console.log(user)
//       user.save(function (err, user) {
//         // if (err) return next(err);
//         if (err) {
//           console.log(err)
//         } else { 

//           res.redirect('/profile');
//         }
        
//         // req.logIn(user, function(err) {
//           //   if (err) return next(err);
//             // res.redirect('/profile');
          
//           // })
//       });
//         // res.redirect('/login');
//     }
//   });
// });


router.get('/logout', function (req, res, next) {
  // req.logout();
  // res.redirect('/')
  // next()
  req.session.destroy(function () {
    res.redirect('/');
  });
});

// router.get('/logout', function(req, res, next) {
//   req.logout();
//   res.redirect('/');
// });

router.get('/edit-profile', function(req, res, next) {
  res.render('accounts/edit-profile', {
    message: req.flash('success')
  });
});

router.post('/edit-profile', function(req, res, next) {
  User.findOne({ _id: req.user._id }, function(err, user) {

    if (err) return next(err);

    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Successfully Edited your profile');
      return res.redirect('/profile');
    });
  });
});

module.exports = router;
