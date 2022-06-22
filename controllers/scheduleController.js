"use strict";
const moment = require('moment');
const nodemailer = require('nodemailer');
const coordinator = require('../lib/coordinator.js');
const feedURL = "http://localhost:3001/2019.json";
const User = require("../models/user");

module.exports = {
  availability: (req, res, next) => {
    let userId = res.locals.currentUser._id;
    User.findById(userId)
      .then(user => {
        res.locals.dates = coordinator.getFormattedDates();
        res.locals.userAvailability = user.availability.map(date => moment(date).format('dddd Do MMMM YYYY'));;
        next();
      })
      .catch(error => {
        console.log(`Error fetching user data: ${error.message}`);
        next(error);
      });
  },

  availabilityView: (req, res) => {
    res.render("schedule/availability");
  },

  categories: (req, res, next) => {
    let userId = res.locals.currentUser._id;
    User.findById(userId)
      .then(user => {
        let dates = user.availability;
        res.locals.userCategories = user.categories;
        res.locals.categories = coordinator.getCategories(dates);
        next();
      })
      .catch(error => {
        console.log(`Error fetching user data: ${error.message}`);
        next(error);
      });
  },

  categoriesView: (req, res) => {
    res.render("schedule/categories");
  },

  films: (req, res, next) => {
    let userId = res.locals.currentUser._id;
    User.findById(userId)
      .then(user => {
        let dates = user.availability;
        let categories = user.categories;
        res.locals.userFilms = user.films;
        res.locals.films = coordinator.getFilms(dates, categories);
        next();
      })
      .catch(error => {
        console.log(`Error fetching user data: ${error.message}`);
        next(error);
      });
  },

  filmsView: (req, res) => {
    res.render("schedule/films");
  },

  priorities: (req, res, next) => {
    let userId = res.locals.currentUser._id;
    User.findById(userId).lean()
      .then(user => {
        let dates = user.availability;
        let categories = user.categories;
        let filmIds = user.films;
        res.locals.films = coordinator.getSelectedFilms(dates, categories, filmIds);
        res.locals.priorities = user.priorities;
        next();
      })
      .catch(error => {
        console.log(`Error fetching user data: ${error.message}`);
        next(error);
      });
  },

  prioritiesView: (req, res) => {
    res.render("schedule/priorities");
  },

  schedule: (req, res, next) => {
    let userId = res.locals.currentUser._id;
    User.findById(userId).lean()
      .then(user => {
        if (user.updated == true) {
          res.redirect('/schedule/schedule/recalculate');
          return;
        }
        let screeningIds = user.schedule;
        let schedule = coordinator.getScreeningsById(screeningIds);
        res.locals.schedule = schedule;
        res.locals.email = user.email;
        next();
      })
      .catch(error => {
        console.log(`Error fetching user data: ${error.message}`);
        next(error);
      });
  },

  scheduleView: (req, res) => {
    res.render("schedule/schedule");
  },

  setAvailability: (req, res, next) => {
    let userId = res.locals.currentUser._id;
    let availabilityParams = Object.keys(req.body).map(date => moment(date, 'dddd-Do-MMMM YYYY').utcOffset(0, true).toDate());
    User.findByIdAndUpdate(userId, {
      availability: availabilityParams,
      updated: true
    })
      .then(user => {
        res.locals.redirect = '/schedule/categories';
        next();
      })
      .catch(error => {
        console.log(`Error updating availability by user ID: ${error.message}`);
        next(error);
      });
  },

  setCategories: (req, res, next) => {
    let userId = res.locals.currentUser._id;
    let categoryParams = Object.keys(req.body);

    User.findByIdAndUpdate(userId, {
      categories: categoryParams,
      updated: true
    })
      .then(user => {
        res.locals.redirect = '/schedule/films';
        next();
      })
      .catch(error => {
        console.log(`Error updating categories by user ID: ${error.message}`);
        next(error);
      });
  },

  setFilms: (req, res, next) => {
    let userId = res.locals.currentUser._id;
    let filmParams = Object.keys(req.body);
    let existingPriorities;
    User.findById(userId).lean()
      .then(user => {
        existingPriorities = user.priorities;
        if (existingPriorities) {
          for (let film of filmParams) {
            if (!existingPriorities.hasOwnProperty(film)) {
              existingPriorities[film] = 'low';
            }
          }
        }
        User.findByIdAndUpdate(userId, {
          films: filmParams,
          updated: true,
          priorities: existingPriorities
        })
          .then(user => {
            res.locals.redirect = '/schedule/priorities';
            next();
          })
          .catch(error => {
            console.log(`Error updating films by user ID: ${error.message}`);
            next(error);
          });
      })
      .catch(error => {
        console.log(`Error fetching user data: ${error.message}`);
        next(error);
      });
  },

  setPriorities: (req, res, next) => {
    let userId = res.locals.currentUser._id;
    let priorityParams = req.body;

    User.findByIdAndUpdate(userId, {
      priorities: priorityParams,
      updated: true
    })
      .then(user => {
        next();
      })
      .catch(error => {
        console.log(`Error updating priorities by user ID: ${error.message}`);
        next(error);
      });
  },

  setSchedule: (req, res, next) => {
    let userId = res.locals.currentUser._id;

    User.findById(userId).lean()
      .then(user => {
        let dates = user.availability;
        let filmIds = user.films;
        let priorities = user.priorities;
        let schedule = coordinator.getSchedule(dates, filmIds, priorities);
        let screeningIds = [];
        for (let screening in schedule) {
          screeningIds.push(schedule[screening].id);
        }
        User.findByIdAndUpdate(userId, {
          schedule: screeningIds,
          updated: false
        })
        .catch(error => {
          console.log(`Error updating schedule by user ID: ${error.message}`);
          next(error);
        })
      })
      .then(user => {
        res.locals.redirect = '/schedule/schedule';
        next();
      })
      .catch(error => {
        console.log(`Error fetching user data: ${error.message}`);
        next(error);
      })
  },

  emailSchedule: (req, res) => {
    let userId = res.locals.currentUser._id;
    User.findById(userId).lean()
      .then(user => {
        let userEmail = user.email;
        let screeningIds = user.schedule;
        let schedule = coordinator.getScreeningsById(screeningIds);
        let screeningsByDate = {};
        for (let screening of schedule) {
          let festDate = new Date(screening.start.getFullYear(), screening.start.getMonth(), screening.start.getDate());
          if (!screeningsByDate.hasOwnProperty(festDate)) {
            screeningsByDate[festDate] = [screening];
          } else {
            screeningsByDate[festDate].push(screening);
          }
        }
        let html =
        `
        <h1 style="text-align: center;">Your Schedule</h1>
        <hr />
        <table class="table" cellpadding="10" style="width: 100%;">
          <thead style="text-align: left;">
            <tr>
              <th>Film</th>
              <th>Time</th>
              <th>Venue</th>
            </tr>
          </thead>
          <tbody>
        `;

        for (let date in screeningsByDate) {
          screeningsByDate[date].forEach(screening => {
            html +=
            `
            <tr>
              <td style="font-size: 12px">${screening.film.title}</td>
              <td style="font-size: 12px">${screening.getFormattedDatetime()}</td>
              <td style="font-size: 12px">${screening.venue}</td>
            </tr>
            `;
          })
        }

        html +=
        `
          </tbody>
        </table>
        `;


        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "matthewcoady@gmail.com",
            pass: "sjasccfzwbegwyco"
          }
        });

        transporter.sendMail({
          from: '"Matthew Coady" <matthewcoady@gmail.com>',
          to: userEmail,
          subject: "Your EIFF Schedule",
          text: "Hello world?",
          html: html
        })
          .then(info => {
            console.log("Message sent: %s", info.messageId);
            res.status(200).end();

          })
          .catch(error => {
            console.log(`Error emailing schedule: ${error.message}`);
            next(error);
          });
      });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath !== undefined) res.redirect(redirectPath);
    else next();
  },
};
