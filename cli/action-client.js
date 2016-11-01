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
const cprocess = require('child_process');

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
    stream.end('ryou-server user add '+ config.username + '\nexit\n');
    const res = await utils.streamPromise(stream);
    console.log(res.data);
  } catch(err) {
    console.error('[ryou]create user error', err.toString());
  }
}

async function addProject(name, dir, options) {
  if (dir == undefined) {
    dir = process.cwd();   
  } else {
    dir = path.resolve(process.cwd(), dir);
  }

  if (!dir.endsWith('dist')) {
    dir = path.resolve(dir, 'dist');
  }
  try {
    var config = options || await utils.getConfig();
    if (config.projects && config.projects[name] && config.projects[name].username == config.username) {
      console.log('[Ryou]project name already existedd');
      process.exit(1);
    }

    config.projects = config.projects || {};

    const conn = await utils.sshPromise(config);
    console.log('connect');
    const stream = await utils.shellPromise(conn);
    stream.end('ryou-server project add ' + config.username + ' ' + name + '\nexit\n');
    const res = await utils.streamPromise(stream);
    console.log(res.data);
    config.projects[name] = {
      username: config.username,
      path: dir,
    };
    await pify(fs.writeFile)(path.resolve(process.env.HOME, '.ryourc'), JSON.stringify(config));
  } catch(err) {
    console.error('[ryou]add peoject error', err);
  }
}

function pushProject(config, project) {
  return new Promise((resolve, reject) => {
    let remotePath = path.resolve(config.remotePath, config.projects[project].username, project);
    console.log('remotePath', remotePath);
    console.log('scp -r ' + config.projects[project].path + '/* ' + config.user + '@' + config.host + ':' + remotePath);
    console.log('[Ryou]Copy files to server...');
    cprocess.exec(
      'scp -r ' + config.projects[project].path + '/* ' + config.user + 
      '@' + config.host + ':' + remotePath,
      (err, stdout, stderr) => {
        if (err) reject(err);
        console.log('[Ryou]finish!');
        console.log(
          '[Ryou]http://' + config.host + ':' + config.ryouPort + '/' +
          config.username + '/' + project
        );
        resolve({
          stdout: stdout,
          stderr: stderr,
        });
      }
    ).stdout.pipe(process.stdout);
  });
}

async function push(dir) {
  if (!dir) {
    dir = process.cwd();
  } else {
    dir = path.resolve(process.cwd(), dir);
  }

  if (!dir.endsWith('dist')) {
    dir = path.resolve(dir, 'dist');
  }

  try {
    let config = await utils.getConfig();
    for (let key in config.projects) {
      if (config.projects[key].path == dir) {
        await pushProject(config, key);
        return;
      }
    }
  } catch(err) {
    console.error('[Ryou] push error', err);
  }

  console.log('[Ryou]can ont find this path in project, please run ryou project add <name> [path]');
}

module.exports = {
  createUser: createUser,
  addProject: addProject,
  push: push,
}
