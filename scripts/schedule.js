'use strict';

var buildReport = require('./buildReport');
var buildReportsFRatioDaliy = require('./buildReportsFRatioDaliy');
var schedule = require('node-schedule');
 
var j = schedule.scheduleJob('1 8 * * *', function(){
  buildReport.run();
});

var i = schedule.scheduleJob('5 8 * * *', function(){
  buildReportsFRatioDaliy.run();
});
