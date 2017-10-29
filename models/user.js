'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const db = require('../common/connectMongo');

let schema = new Schema({
	
	id            : {type : String},
	type          : {type : String},
	access_token  : {type : String},
	refresh_token : {type : String},
	leaguer       : {type : Number},  //0: 非会员 1:会员
	start_time    : {type : Date},
	end_time      : {type : Date}
	
}, {collection: 'users'});

module.exports = db.api.model('user', schema);