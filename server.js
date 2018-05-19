const dotenv = require("dotenv").config();
const express = require("express");
const path = require("path");
const passport = require("./passport/passport");
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const logger = require("morgan")("tiny");

const routes = require("./controllers");

const PORT = process.env.PORT || 3001;
const app = express();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/my-first-mern");

//#region MIDDLEWARE

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//passport
app.use(session({ 
  secret: "I 4m 4bs0lut3ly aw3s0m3!", 
  resave: true, 
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection}) 
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(logger);

//controllers
app.use(routes);

//#endregion MIDDLEWARE

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.listen(PORT, function() {
  console.log(`🌎 ==> Server now on port ${PORT}!`);
});
