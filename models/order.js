'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const db = require('../common/connectMongo');

let schema = new Schema({
	body              : {type : String},
	charset           : {type : String},
	format            : {type : String},
	notify_url        : {type : String},
	out_trade_no      : {type : String},
	sign_type         : {type : String},
	status            : {type : Number},//1.未支付订单 2.支付中 3.订单完成 4.订单取消 5、订单退款 6.订单异常
	subject           : {type : String},
	total_amount      : {type : String},
	type              : {type : Number},
	user_id           : {type : String},
	channel           : {type : String}
}, {collection: 'orders', timestamps: true});

module.exports = db.api.model('order', schema);