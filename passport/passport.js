const passport = require("passport");
const LocalStrategy = require("passport-local");
const router = require("express").Router();

const db = require("../models");

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.User.findById(id)
  .then(user => done(null, user))
  .catch(err => done(err));
});

passport.use(new LocalStrategy({
    usernameField:"email"
  },
  function(username, password, done) {
    db.User.findOne({ email: username })
    .then(user => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    })
    .catch(err => done(err));
  }));


module.exports = passport;