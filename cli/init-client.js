/*
 * init-client.js
 * Copyright (C) 2016 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const fs = require('fs');
const pify = require('pify');
const path = require('path');
const conn = new require('ssh2').Client();
const process = require('process');
const cprocess = require('child_process');
const inquirer = require('inquirer');

const utils = require('../utils');

const questions = [
  {
    type: 'input',
    name: 'user',
    default: 'disoul',
    message: 'input your ssh-server user',
  },
  {
    type: 'input',
    name: 'host',
    default: '120.26.114.168',
    message: 'input your ssh-server host',
  },
  {
    type: 'password',
    name: 'password',
    message: 'Enter your ssh-server password',
  }
];

const clientConfig = {
  privateKey: '',
  host: '',
  user: '',
  remotePath: '',
  ryouPort: '',
};

async function getPublicKey() {
  try {
    let files = await utils.execPromise(cprocess, 'ls -a',{
      cwd: path.resolve(process.env.HOME, '.ssh')
    });
    let filelist = [];
    files.split('\n').map(file => {
      if (file.endsWith('.pub')) {
        return filelist.push(file);
      }
    });
    if (filelist.length === 0) {
      console.error('[Ryou]Can not find public key in your ~/.ssh folder\nplease run ssh-keygen');
      process.exit(1);
    }

    let answer = filelist.length === 1 ? { publicKey: filelist[0] } : await inquirer.prompt([
      {
        type: 'list',
        name: 'publicKey',
        message: 'please select a publickKey to connet to ssh-server',
        choices: filelist,
      }
    ]);
    return path.resolve(process.env.HOME, '.ssh', answer.publicKey);
  } catch(err) {
    console.error(err);
  }
}

function ssh(options) {
  return new Promise((resolve, reject) => {
    conn.on('ready', async () => {
      console.log('[Ryou]SSH client ready');

      // get server config
      try {
        let stream = await utils.execPromise(conn, 'cat .ryourc');
        let res = await utils.streamPromise(stream);
        if (res.code !== 0) {
          console.error('[Ryou] Can not find .ryourc in server\nrun ryou init server in your server first');
          process.exit(1);
        } else {
          let serverConfig = JSON.parse(res.data);
          clientConfig.ryouPort = serverConfig.ryouPort;
          clientConfig.remotePath = serverConfig.ryouPath;
        }
      } catch(err) {
        console.error('ERROR', err);
      }

      console.log('[Ryou] config ssh public key..');
      // copy public key to server
      try {
        let publicKeyPath = await getPublicKey();
        clientConfig.privateKey = publicKeyPath.slice(0, -4);
        let publicKey = await pify(fs.readFile, {encoding: 'utf8'})(publicKeyPath);
        let stream = await utils.execPromise(conn, "sed -i '$a\\" + publicKey + "' ~/.ssh/authorized_keys");
        let res = await utils.streamPromise(stream);
        console.log('[Ryou]copy public key to server successful');
        conn.end();
        resolve();
      } catch(err) {
        console.error('Error!', err.toString());
      }
    }).connect({
      host: options.host,
      port: 22,
      username: options.user,
      password: options.password
    }); 
  });
}

async function init() {
  try {
    let answer = await inquirer.prompt(questions);
    await ssh(answer);

    clientConfig.host = answer.host;
    clientConfig.user = answer.user;

    console.log('[Ryou]Write .ryourc file...');
    await pify(fs.writeFile)(path.resolve(process.env.HOME, '.ryourc'), JSON.stringify(clientConfig));
    console.log('[Ryou]Init success!');
  } catch(err) {
    console.error(err)
  }
}

module.exports = init;
