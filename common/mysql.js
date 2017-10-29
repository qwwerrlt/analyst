'use strict';

const moment = require('moment');
const mysql = require('mysql');
const config = require('config');
const _ = require('lodash');

let connection = mysql.createConnection(config.mysql);

connection.connect();

module.exports = connection;
