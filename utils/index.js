/*
 * index.js
 * Copyright (C) 2016 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const fs = require('fs');
const pify = require('pify');
const process = require('process');
const inquirer = require('inquirer');
const path = require('path');
const conn = new require('ssh2').Client();

async function checkConfig() {
  try {
    await pify(fs.access)(path.resolve(process.env.HOME, '.ryourc'));
    return true;
  } catch(err) {
    return false;
  }
}

async function getConfig() {
  try {
    if (await checkConfig) {
      let config = await pify(fs.readFile)(path.resolve(process.env.HOME, '.ryourc'));
      return JSON.parse(config);
    } else {
      throw new Error();
    }
  } catch(err) {
    console.error('[Ryou]can not read .ryourc file',err);
    return null;
  }
}

function execPromise(conn, exec, options) {
  return new Promise((resolve, reject) => {
    if (options) {
      conn.exec(exec, options, (err, stream) => {
        if (err) reject(err);
        resolve(stream);
      })
    } else {
      conn.exec(exec, (err, stream) => {
        if (err) reject(err);
        resolve(stream);
      })
    }
  });
}

function streamPromise(stream) {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.setEncoding('utf8');
    stream.on('close', (code, signal) => {
      resolve({
        'data': data,
        'code': code,
        'signal': signal,
      });
    }).on('data', chunk => {
      data += chunk;
    }).stderr.on('data', err => {
      reject(err);
    });
  });
}

async function sshPromise(options) {
  if (!options.passphrase) {
    try {
      let answer = await inquirer.prompt([{
        type: 'password',
        name: 'passphrase',
        message: 'input your ssh privateKey passphrase'
      }]);
      options.passphrase = answer.passphrase;
    } catch(err) {
      console.error(err);
    }
    return new Promise((resolve, reject) => {
      conn.on('ready', () => {
        resolve(conn);
      }).connect({
        host: options.host,
        port: 22,
        username: options.user,
        privateKey: fs.readFileSync(options.privateKey),
        passphrase: options.passphrase,
      });
    });
  }
}

module.exports = {
  checkConfig: checkConfig,
  getConfig: getConfig,
  execPromise: execPromise,
  streamPromise: streamPromise,
  sshPromise: sshPromise,
};
