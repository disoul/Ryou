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
  .get(
    'static',
    '/:user/:project/:file*',
    async (ctx) => {
    console.log(ctx.params);
    if (!ctx.params.file) {
        ctx.redirect(router.url('static', {user: ctx.params.user, project: ctx.params.project, file: 'index.html'}));
    }
    let user = ctx.params.user;
    let project = ctx.params.project;
    let projectPath = path.resolve(ctx.config.ryouPath, user, project);
    let file = ctx.params.file ? ctx.params.file : 'index.html';
    ctx.body = await pify(fs.readFile)(path.resolve(projectPath, file), {encoding:'utf8'});
  })

app
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(options.port);
console.log('listen on', options.port);
