//login, users, reguster will be here

const express = require('express'); //we use the express router
const router = express.Router(); //to use express route, we need to create a variable called router and set that to `express.Router()`
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2} = req.body;
    let errors = [];

    //check required fields
    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in ALL fields!'});
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
      }
    
      if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
      }

      if(errors.length > 0) {
          res.render('register', {
              errors,
              name,
              password,
              password2
          });
      } else {
          // validation passed
          User.findOne( { email: email }).then(user => {
              if(user) {
                  // user exists
                  errors.push({ msg: 'Email is already registered'});
                  res.render('register', {
                      errors,
                      name, 
                      email,
                      password,
                      password2
                  });
              } else {
                  //stuff
                  const newUser = new User({
                      name, 
                      email,
                      password
                  });

                  // HASH PASSWORD
                  bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                      if (err) throw err;
                      newUser.password = hash;
                      newUser.save()
                        .then(user => {
                          req.flash('success_msg', 'You are now registered and can log in');
                          res.redirect('/users/login');
                        })
                        .catch(err => console.log(err));
                    });
                  });
              }
          });
      }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });
  
  // Logout
  router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
  
  module.exports = router;