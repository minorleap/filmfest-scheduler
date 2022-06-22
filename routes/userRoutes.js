"use strict";

const router = require("express").Router(),
  usersController = require("../controllers/usersController");

router.get("/new", usersController.new);
router.post(
  "/create",
  usersController.validate,
  usersController.create,
  usersController.authenticate
);
router.get("/login", usersController.login);
router.post("/login", usersController.authenticate);
router.get("/logout", usersController.logout, usersController.redirectView);

module.exports = router;
