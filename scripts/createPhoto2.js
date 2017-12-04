'use strict';

const fs = require('fs');
const _  = require("lodash");
const async = require('async');
const Analyst = require('../models/analyst');
const domain = 'http://182.92.240.223:8080';

if (!process.argv[2]) return console.error('please give a directory of pictures');
let path = process.argv[2];
async.waterfall([
	(_cb) => {
		Analyst.find({}, _cb);
	},
	(analysts, _cb) => {
		async.eachSeries(analysts, (analyst, cb) => {
			savePhoto(analyst, cb);
		}, _cb);
	}
	], 
(err) => {
	if (err) return console.error(err);
	console.log('success');
})

function savePhoto(analyst, cb) {
	let photo2 = null;
	if (fs.existsSync(`${path}/${analyst.certificateNum}.jpg`)) {
		photo2 = `${domain}/pic/${analyst.certificateNum}.jpg`;
	} else {
		photo2 = analyst.photo;
	}
	Analyst.update({_id:analyst._id}, {photo2}, cb);
}


