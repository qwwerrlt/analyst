'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const db = require('../common/connectMongo');

let schema = new Schema({
	order_id          : {type : String},
	user_id           : {type : String},
	status            : {type : Number},    //-1.支付异常 0.支付取消 1.完成 2、退款 
	pay_type          : {type : Number},    //1.微信 2.阿里
	total_amount      : {type : Number},    //订单总额
	receipt_amount    : {type : Number},    //支付总额
	fee_type          : {type : String},    //默认CHY 人民币
	trade_type        : {type : String},    //APP
	trade_no          : {type : String},    //交易号
	out_trade_no      : {type : String, unique : true},    //商户订单号
	payment_time      : {type : Date}
}, {collection: 'trades', timestamps: true});

module.exports = db.api.model('trade', schema);
