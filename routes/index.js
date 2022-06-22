"use strict";

const router = require("express").Router(),
  userRoutes = require("./userRoutes"),
  errorRoutes = require("./errorRoutes"),
  scheduleRoutes = require("./scheduleRoutes"),
  homeRoutes = require("./homeRoutes");

router.use("/users", userRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/", homeRoutes);
router.use("/", errorRoutes);

module.exports = router;
