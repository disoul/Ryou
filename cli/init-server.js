/*
 * init-server.js
 * Copyright (C) 2016 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const fs = require('fs');
const pify = require('pify');
const path = require('path');
const process = require('process');

async function init() {
  console.log('[Ryou]Install Ryou in current dir...');
  try {
    await pify(fs.mkdir)(path.resolve(process.cwd(), 'Ryou'));
    console.log('[Ryou]Ryou create finish, please run "ryou run" in Ryou');
  } catch(err) {
    console.error('[Ryou]Create Error', err);
  }
}

module.exports = init;
