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

async function createUser(options, user) {
  if (user == undefined) {
    user = options;
    options = undefined;
  }

  try {
    const config = options || await utils.getConfig();
    const conn = await utils.sshPromise(config);
    console.log('connect');
    const stream = await utils.execPromise(conn, 'ryou-server user add ' + user);
    const res = await utils.streamPromise(stream);
    conn.end();
    console.log(res);
  } catch(err) {
    console.error('[ryou]create user error', err.toString());
  }
}

module.exports = {
  createUser: createUser,
}
