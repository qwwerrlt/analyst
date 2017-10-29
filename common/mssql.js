'use strict';

const moment = require('moment');
const mssql = require('mssql');
const config = require('config');
const _ = require('lodash');

module.exports = function(cb) {
  console.log(moment().format(), 'now connecting mssql', config.mssql);
  mssql.connect(config.mssql, cb);
};

mssql.on('error', function(err) {
  console.log(err);
});
