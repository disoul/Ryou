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

async function createUser() {
  let config = await utils.getConfig();
  let port = config.serverPort || 8080;
  let res = await utils.execPromise(cprocess, 'wget -O - http://' + config.host + ':8080', {});
  
  console.log(res);
}

createUser();
