/*
 * create-user.js
 * Copyright (C) 2016 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const fs = require('fs');
const pify = require('pify');
const path = require('path');
const process = require('process');
const User = require('../server/mongo/mongo');

const utils = require('../utils/');

async function createUser(username) {
  let user = new User({
    name: username,
    projects: [],
  });
  try {
    let data = await user.save();
    console.log('[Ryou] mongo: user saved');

    let config = await utils.getConfig();
    await pify(fs.mkdir)(path.resolve(config.ryouPath, username));
    console.log('[Ryou] user floder created, finish');
    return;
  } catch(err) {
    console.error('[Ryou] createUser error', err);
  }
}

module.exports = {
  createUser: createUser,
};
