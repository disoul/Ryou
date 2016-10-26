/*
 * server.js
 * Copyright (C) 2016 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
var koa = require('koa');
var app = koa();

var process = require('process');

var options = {
  port: process.env.RYOU_PORT || 8008,
}

app.use(function *(){
  this.body = 'Hello!';
});

app.listen(options.port);
