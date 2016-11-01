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

app.use(async (ctx, next) => {
  ctx.config  = await utils.getConfig();
  await next();
})

router
  .get('/:path*', async (ctx, next) => {
    let matches = ctx.params.path.match(/(\.[^\/\.]+)$/);
    console.log(matches);
    
    if (matches === null) {
      await next();
    } else {
      console.log(ctx.request.url); 
      console.log(ctx.request.origin); 
    }
  })
  .get(
    '/:user/:project',
    async (ctx) => {
    console.log(ctx.params);
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
