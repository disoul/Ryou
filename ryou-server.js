#!/usr/bin/env nodeHarmony
'use strict';

var cmd = require('commander');
var path = require('path');
var info = require('./package.json');
var process = require('process');
var cprocess = require('child_process')

var serverInit = require('./cli/init-server.js');

cmd
  .version('v' + info.version);

cmd
  .command('init')
  .action(target => {
    serverInit();
  });

cmd
  .command('run')
  .action( () => {
    console.log('[Ryou]Server Start...');
    cprocess.exec('node --harmony server.js', {
      cwd: path.resolve(__dirname, './server/')
    }).stdout.pipe(process.stdout);
  });

cmd.parse(process.argv);
