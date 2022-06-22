"use strict";

const router = require("express").Router(),
  usersController = require("../controllers/usersController"),
  scheduleController = require("../controllers/scheduleController");

router.get("/availability", usersController.isAuthenticated, scheduleController.availability, scheduleController.availabilityView);
router.post("/availability", usersController.isAuthenticated, scheduleController.setAvailability, scheduleController.redirectView);
router.get("/categories", usersController.isAuthenticated, scheduleController.categories, scheduleController.categoriesView);
router.post("/categories", usersController.isAuthenticated, scheduleController.setCategories, scheduleController.redirectView);
router.get("/films", usersController.isAuthenticated, scheduleController.films, scheduleController.filmsView);
router.post("/films", usersController.isAuthenticated, scheduleController.setFilms, scheduleController.redirectView);
router.get("/priorities", usersController.isAuthenticated, scheduleController.priorities, scheduleController.prioritiesView);
router.post("/priorities", usersController.isAuthenticated, scheduleController.setPriorities, scheduleController.setSchedule, scheduleController.redirectView);
router.get("/schedule/recalculate", usersController.isAuthenticated, scheduleController.setSchedule, scheduleController.redirectView);
router.get("/schedule", usersController.isAuthenticated, scheduleController.schedule, scheduleController.scheduleView);
router.get("/email", usersController.isAuthenticated, scheduleController.emailSchedule);

module.exports = router;
 // path = {
 //   one: "/availability",
 //   two:
 //   "smonething else "
 // }
 //
 // router.get(path.one, usersController.isAuthenticated, scheduleController.availability, scheduleController.availabilityView);
