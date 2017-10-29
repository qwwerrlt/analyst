'use strict';

const mongoose = require('mongoose');

let analyst = mongoose.createConnection('mongodb://182.92.240.223:38128/analyst');
let api     = mongoose.createConnection('mongodb://182.92.240.223:38128/api');

mongoose.connection.on('error', function () {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});
mongoose.connection.once('open', function() {
  console.log('open mongodb success');
});

module.exports = {
	analyst,
	api
}