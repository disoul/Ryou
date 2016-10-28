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
const User = require('../server/mongo/mongo';i

const utils = require('../utils/');

async function createUser(user) {
  let user = new User({
    name: user,
    projects: [],
  });
  try {
    let data = await pify(user.save)();
    console.log('[Ryou] mongo: user saved');

    let config = await utils.getConfig();
    await pify(fs.mkdir)(path.resolve(config.ryouPath), user);
    console.log('[Ryou] user floder created, finish');
  } catch(err) {
    console.error('[Ryou] createUser error', err);
  }
}

module.exports = {
  createUser: createUser,
};
