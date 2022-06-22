"use strict";

const User = require("../models/user"),
  passport = require("passport"),
  getUserParams = body => {
    return {
      email: body.email,
      password: body.password,
      availability: [],
      categories: [],
      films: [],
      priorities: {},
      schedule: [],
      updated: false
    };
  };

module.exports = {

  new: (req, res) => {
    res.render("/");
  },

  create: (req, res, next) => {
    if (req.skip) next();
    let newUser = new User(getUserParams(req.body));
    User.register(newUser, req.body.password, (e, user) => {
      if (user) {
        req.flash("success", `${user.email}'s account created successfully!`);
        res.locals.redirect = "/schedule/availability";
        next();
      } else {
        req.flash("error", `Failed to create user account because: ${e.message}.`);
        res.locals.redirect = "/";
        next();
      }
    });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath !== undefined) res.redirect(redirectPath);
    else next();
  },

  login: (req, res) => {
    res.render("/");
  },
  validate: (req, res, next) => {
    req
      .sanitizeBody("email")
      .normalizeEmail({
        all_lowercase: true
      })
      .trim();
    req.check("email", "Email is invalid").isEmail();
    req.check("password", "Password cannot be empty").notEmpty();
    req.getValidationResult().then(error => {
      if (!error.isEmpty()) {
        let messages = error.array().map(e => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/users/new";
        next();
      } else {
        next();
      }
    });
  },
  authenticate: passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: "Failed to login.",
    successRedirect: "/schedule/availability",
  }),
  logout: (req, res, next) => {
    req.logout();
    res.locals.redirect = "/";
    next();
  },
  isAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "Please log in to use this application");
      res.redirect('/')
    } else {
      next();
    }
  }
};
