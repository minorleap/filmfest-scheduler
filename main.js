"use strict";

const express = require("express"),
  layouts = require("express-ejs-layouts"),
  app = express(),
  router = require("./routes/index"),
  morgan = require("morgan"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  cookieParser = require("cookie-parser"),
  expressSession = require("express-session"),
  expressValidator = require("express-validator"),
  connectFlash = require("connect-flash"),
  User = require("./models/user");

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/scheduler_db",
  { useNewUrlParser: true, useFindAndModify: false }
);
mongoose.set("useCreateIndex", true);

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");

//app.use(morgan("combined"));
app.use(layouts);
app.use(express.static("public"));
app.use(expressValidator());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());

app.use(cookieParser(""));
app.use(
  expressSession({
    secret: "",
    cookie: {
      maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
  })
);
app.use(connectFlash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
});

app.use("/", router);

const server = app.listen(app.get("port"), () => {
    console.log(`Server running at http://localhost:${app.get("port")}`);
  });
