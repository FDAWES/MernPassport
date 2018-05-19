const passport = require("passport");
const LocalStrategy = require("passport-local");
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const db = require("../models");

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("deserialize");
  db.User.findById(id)
    .then(({ id, displayName, photoUrl }) => done(null, { id, displayName, photoUrl }))
    .catch(err => done(err));
});

/********************************Local Strategey******************************/
passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    function(username, password, done) {
      db.User.findOne({ email: username })
        .then(user => {
          if (!user) {
            return done(null, false, { message: "Incorrect username." });
          }

          if (!user.validPassword(password)) {
            return done(null, false, { message: "Incorrect password." });
          }

          const { id, displayName, photoUrl } = user;

          return done(null, { id, displayName, photoUrl });
        })
        .catch(err => {
          console.log(err);
          done(err);
        });
    }
  )
);

/********************************Google Strategey******************************/
const options = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
};

passport.use(
  new GoogleStrategy(options, function(accessToken, refreshToken, profile, cb) {
    db.User.findOne({ googleId: profile.id })
      .then(user => {
        if (user) {
          return user;
        }

        return db.User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          photoUrl: profile._json.image.url
        });
      })
      .then(user => cb(null, user))
      .catch(err => cb(err));
  })
);

module.exports = passport;
