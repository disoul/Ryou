#!/usr/bin/env nodeHarmony
'use strict';

var cmd = require('commander');
var path = require('path');
var info = require('./package.json');
var process = require('process');
var cprocess = require('child_process')

var clientInit = require('./cli/init-client.js');
var actions = require('./cli/action-client.js');

cmd
  .version('v' + info.version);

cmd
  .command('init')
  .action(target => {
    clientInit();
  });
cmd
  .command('user <action> <user>')
  .action(async (action, user) => {
    console.log(action, user);
    switch(action) {
      case 'add':
        await actions.createUser(user);
        break;
      default:
        break;
    }
    process.exit(0);
  });

cmd.parse(process.argv);
