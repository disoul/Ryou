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

const utils = require('../utils/');

async function createUser(username) {
  try {
    let config = await utils.getConfig();
    await pify(fs.mkdir)(path.resolve(config.ryouPath, username));
    console.log('[Ryou] user floder created, finish');
    return;
  } catch(err) {
    console.error('[Ryou] createUser error', err);
  }
}

async function addProject(user, dir) {
  try {
    let config = await utils.getConfig();
    await pify(fs.mkdir)(path.resolve(config.ryouPath, user, dir));
    console.log('[Ryou] project floder created, finish');
    return;
  } catch(err) {
    console.error('[Ryou] addProject error', err);
  }
}

module.exports = {
  createUser: createUser,
  addProject: addProject,
};
