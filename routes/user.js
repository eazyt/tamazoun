const router = require('express').Router();
const User = require('../models/user')
const mongoose = require('mongoose')

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


  User.findOne({ email: req.body.email }, (err, userExists) => {
    if (userExists) {
      req.flash('errors', 'Email already exists')
      return res.redirect('/register')

    } else {
      user.save((err) => {
        if (err) return next(err);
       return req.redirect('/')
      })
    }
  })
})
  
module.exports = router;