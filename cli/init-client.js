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
  publicKey: '',
  host: '',
  user: '',
};

async function checkConfig() {
  try {
    await pify(fs.access)(path.resolve(process.env.HOME, '.ryourc'));
    return true;
  } catch(err) {
    return false;
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

async function getPublicKey() {
  try {
    let files = await execPromise(cprocess, 'ls -a',{
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
        let stream = await execPromise(conn, 'cat .ryourc');
        let res = await streamPromise(stream);
        if (res.code !== 0) {
          console.error('[Ryou] Can not find .ryourc in server\nrun ryou init server in your server first');
          process.exit(1);
        } else {
          let serverConfig = JSON.parse(res.data);
        }
      } catch(err) {
        console.error('ERROR', err);
      }

      console.log('[Ryou] config ssh public key..');
      // copy public key to server
      try {
        let publicKeyPath = await getPublicKey();
        clientConfig.publicKey = publicKeyPath;
        let publicKey = await pify(fs.readFile, {encoding: 'utf8'})(publicKeyPath);
        let stream = await execPromise(conn, "sed -i '$a\\" + publicKey + "' ~/.ssh/authorized_keys");
        let res = await streamPromise(stream);
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