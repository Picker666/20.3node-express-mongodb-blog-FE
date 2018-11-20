/*
* @Author: Administrator
* @Date:   2018-11-20 10:58:09
* @Last Modified by:   Administrator
* @Last Modified time: 2018-11-20 10:59:31
*/

'use strict';

var ioRedis = require('ioredis');
var redis = new ioRedis();
// 默认127.0.0.1:6379
exports.redis = redis;
