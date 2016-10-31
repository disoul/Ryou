/*
 * server.js
 * Copyright (C) 2016 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
'use strict';
var fs = require('fs');
var path = require('path');

var koa = require('koa');
var router = require('koa-router')();
var app = new koa();
var utils = require('../utils');

var pify = require('pify');
var process = require('process');

var options = {
  port: process.env.RYOU_PORT || 8008,
}

var config;
 

router
  .get('/:user/:project', async (ctx, next) => {
      console.log(ctx, next);
      ctx.config  = await utils.getConfig();
      console.log(ctx.config);
      await next();
    }, async (ctx) => {
    console.log('12312');
    let user = ctx.params.user;
    let project = ctx.params.project;
    let projectPath = path.resolve(ctx.config.ryouPath, user, project);
    ctx.body = await pify(fs.readFile)(path.resolve(projectPath, 'index.html'), {encoding:'utf8'});
  })

app
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(options.port);
console.log('listen on', options.port);
