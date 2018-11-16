/*
* @Author: Administrator
* @Date:   2018-11-12 16:34:04
* @Last Modified by:   Administrator
* @Last Modified time: 2018-11-14 11:01:28
*/

'use strict';

var settings = require('../settings'),
    Db = require('mongodb').Db,
    // Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
 
module.exports = new Db(
	settings.db,
	new Server(settings.host, settings.port),
	{safe: true}
);


// another
 
