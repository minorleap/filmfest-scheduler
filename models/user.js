"use strict";

const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  passportLocalMongoose = require("passport-local-mongoose");

var prioritySchema = new Schema({
  film: Number,
  priority: Number
});

var userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true
    },
    availability: [Date],
    categories: [String],
    films: [String], // [ShowId]
    priorities: Map, // [{showId: priority}]
    schedule: [String], // [eventId]
    updated: Boolean
  },
  {
    timestamps: true
  }
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});

module.exports = mongoose.model("User", userSchema);
