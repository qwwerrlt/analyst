'use strict';

var buildReport = require('./buildReport');
var buildReportsFRatioDaliy = require('./buildReportsFRatioDaliy');
var schedule = require('node-schedule');
 
var j = schedule.scheduleJob('0 8 * * *', function(){
  buildReport.run();
});

var i = schedule.scheduleJob('8 8 * * *', function(){
  buildReportsFRatioDaliy.run();
});