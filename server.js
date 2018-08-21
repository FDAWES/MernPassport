// For the .env file to hide my credentials from the world
const dotenv = require("dotenv").config(); 
// Express
const express = require("express"); 
// Path
const path = require("path"); 
// My passport object configure with local (and potentially ) google strategy.
const passport = require("./passport/passport");
// Express Session 
const session = require("express-session"); 
// Used to store our session info insid of MongoDB
const MongoStore = require('connect-mongo')(session);
// Mongoose
const mongoose = require("mongoose");
// Body Parser
const bodyParser = require("body-parser");
//Morgan Logger
const logger = require("morgan")("tiny");

// Pulling in my controllers to handle routing
const routes = require("./controllers");

const PORT = process.env.PORT || 3001;

const app = express();

// Connection to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/my-first-mern");

//#region MIDDLEWARE

//body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Setuup express to use sessions and also to save session information inside of Mongo
app.use(session({ 
  secret: "I 4m 4bs0lut3ly aw3s0m3!", 
  resave: true, 
  saveUninitialized: true,
  store: new MongoStore({ 
    mongooseConnection: mongoose.connection,
    ttl: 8 * 60 * 60 // 8 Hours
  }) 
}));

// Initialize the passport middleware and session.
app.use(passport.initialize());
app.use(passport.session());
// Telling express to use Morgan
app.use(logger);

// Informing express about my routes
app.use(routes);

//#endregion MIDDLEWARE

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.listen(PORT, function() {
  console.log(`🌎 ==> Server now on port ${PORT}!`);
});
