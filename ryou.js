#!/usr/bin/env node
'use strict';

var cmd = require('commander');
var info = require('./package.json');
var process = require('process');

cmd
  .version('v' + info.version);

cmd
  .command('init <target>')
  .action(target => {
    if (target === 'server') {
      console.log('init server..');
    }
  });

cmd.parse(process.argv);
