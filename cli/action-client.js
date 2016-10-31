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
    var config = options || await utils.getConfig();
    config.username = user;
    await pify(fs.writeFile)(path.resolve(process.env.HOME, '.ryourc'), JSON.stringify(config));
    console.log(config);
    const conn = await utils.sshPromise(config);
    console.log('connect');
    const stream = await utils.shellPromise(conn);
    stream.end('ryou-server user add disoul\nexit\n');
    const res = await utils.streamPromise(stream);
    console.log(res.data);
  } catch(err) {
    console.error('[ryou]create user error', err.toString());
  }
}

async function addProject(name, dir, options) {
  if (dir == undefined) {
    dir = '';   
  }
  try {
    var config = options || await utils.getConfig();
    if (config.projects && config.projects[name] && config.projects[name].username == config.username) {
      console.log('[Ryou]project name already existedd');
      process.exit(1);
    }

    config.projects = config.projects || {};
    config.projects[name] = {
      username: config.username,
      path: path.resolve(process.cwd(), dir)
    };
    await pify(fs.writeFile)(path.resolve(process.env.HOME, '.ryourc'), JSON.stringify(config));

    const conn = await utils.sshPromise(config);
    console.log('connect');
    const stream = await utils.shellPromise(conn);
    stream.end('ryou-server project add ' + name + ' ' + path + '\nexit\n');
    const res = await utils.streamPromise(stream);
    console.log(res.data);
  } catch(err) {
    console.error('[ryou]add peoject error', err);
  }
}

module.exports = {
  createUser: createUser,
  addProject: addProject,
}
