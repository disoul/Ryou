/*
 * server.js
 * Copyright (C) 2016 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
'use strict';
var koa = require('koa');
var router = require('koa-router')();
var app = new koa();

var pify = require('pify');
var process = require('process');

var User = require('./mongo/mongo.js');

var options = {
  port: process.env.RYOU_PORT || 8008,
}


router
  .get('/:user/:project', async (ctx, next) => {
    console.log(next);
    let user = new User({
      name: ctx.params.user,
      projects: [],
    });
    try {
      let data = await pify(user.save)();
      console.log(data, 'save success');
    } catch (err) {
      console.err(err);
    }
  })

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(options.port);
console.log('listen on', options.port);
