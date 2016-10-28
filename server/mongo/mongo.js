/*
 * mongo.js
 * Copyright (C) 2016 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/ryou');

var userSchema = new Schema({
  name: { type: String, unique: true },
  projects: [{
    name: String,
  }],
});

var User = mongoose.model('User', userSchema);

module.exports = User;
