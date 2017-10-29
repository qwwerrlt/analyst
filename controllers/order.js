'use strict';

const _           = require('lodash');
const async       = require('async');
const config      = require('config');
const crypto      = require('crypto');
const util        = require('../common/util');
const User        = require('../models/user');
const Order       = require('../models/order');
const Trade       = require('../models/trade');
require('date-utils');

exports.submitOrder = (infos, cb) => {
	async.waterfall([
		(_cb) => {
			console.log('debug',infos.access_token)
			User.findOne({access_token : infos.access_token}, (err, doc) => {
				if (err) {
					_cb(500, err);
				} else if (!doc) {
					_cb(604);
				} else {
					_cb(null, doc);
				}
			});
		},
		(user, _cb) => {
			let order = {
				body              : config.Body[infos.type],
				charset           : 'utf-8',
				format            : 'JSON',
				notify_url        : 'http://pay.onehou.com:8080/notify/ali',
				out_trade_no      :  util.getID('0'),
				sign_type         : 'RSA2',
				status            : 1,
				subject           : '会员开通',
				total_amount      : config.Leaguer[infos.type],
				type              : +infos.type,
				user_id           : user.id,
				channel           : 'ali'
			}
			Order.create(order, (err, doc) => {
				if (err) {
					_cb(500, err);
				} else {
					_cb(null, doc);
				}
			});
		},
		(order, _cb) => {
			let data = {
				app_id      : config.ali.app_id,
				charset     : order.charset,
				format      : order.format,
				method      : 'alipay.trade.app.pay',
				notify_url  : order.notify_url,
				sign_type   : order.sign_type,
				timestamp   : new Date().toFormat("YYYY-MM-DD HH24:MI:SS"),
				version     : '1.0'
			};
			data.biz_content = JSON.stringify({
				timeout_express : "30m",
				product_code    : "QUICK_MSECURITY_PAY",
				total_amount    : order.total_amount,
				subject         : order.subject,    
				body            : order.body,
				out_trade_no    : order.out_trade_no
			});
			let str = '';
			for (let key of Object.keys(data).sort()) {
			    str += `${key}=${data[key]}&`;
			}
			str = str.substring(0, str.length - 1);
			let privateKey = config.privateKey;
			let sign = crypto.createSign('sha256');
			sign.update(str);
			let signiture = sign.sign(privateKey, 'base64').toString();
			let string = '';
			for (let key of Object.keys(data).sort()) {
			    string += `${key}=${encodeURIComponent(data[key])}&`;
			}
			string += `sign=${encodeURIComponent(signiture)}&`;
			_cb(null, string);
		}
	],
	cb
	)
}

exports.aliNotify = (infos, cb) => {
	async.waterfall([
		(_cb) => {
			let sign = infos.sign;
			delete infos.sign;
			delete infos.sign_type;
			let str = '';
			for (let key of Object.keys(infos).sort()) {
			    str += `${key}=${infos[key]}&`;
			}
			str = str.substring(0, str.length - 1);
			let verify = crypto.createVerify('sha256');
			let publicKey = config.publicKey;
			verify.update(str);
			if (verify.verify(publicKey, sign, 'base64')) {
				_cb();
			} else {
				_cb(602);
			}
		},
		(_cb) => {
			Order.findOne({out_trade_no: infos.out_trade_no}, (err, doc) => {
				if (err) {
					_cb(500, err);
				} else if (!doc) {
					_cb(603);
				} else {
					_cb(null, doc);
				}
			});
		},
		(order, _cb) => {
			let trade = {
				order_id          : order._id,
				user_id           : order.user_id,
				status            : 1,
				pay_type          : 2,
				total_amount      : infos.total_amount,
				receipt_amount    : infos.receipt_amount,
				fee_type          : 'CHY',
				trade_type        : 'APP',
				trade_no          : infos.trade_no,
				out_trade_no      : infos.out_trade_no,
				payment_time      : new Date(infos.gmt_payment)
			}
			Trade.create(trade, (err) => {
				if (err) {
					_cb(500, err);
				} else {
					_cb(null, order);
				}
			});
		},
		(order, _cb) => {
			User.findOne({id : order.user_id}, (err, doc) => {
				if (err) {
					_cb(500, err);
				} else if (!doc) {
					_cb(604);
				} else {
					_cb(null, doc, order);
				}	
			});
		},
		(user, order, _cb) => {
			let update = {leaguer : 1};
			if (user.end_time && new Date().compareTo(user.end_time) == -1) {
				if (order.type == 1) {
					update.end_time = user.end_time.addMonths(1);
				} else if (order.type == 2) {
					update.end_time = user.end_time.addYears(1);
				} else {
					return _cb();
				}
			} else {
				update.start_time = new Date();;
				if (order.type == 1) {
					update.end_time = new Date().addMonths(1);
				} else if (order.type == 2) {
					update.end_time = new Date().addYears(1);
				} else {
					return _cb();
				}
			}
			User.update({id : order.user_id}, update, (err) => {
				if (err) {
					_cb(500, err);
				} else {
					_cb();
				}				
			})
		},
		(_cb) => {
			Order.update({out_trade_no: infos.out_trade_no}, {status : 3}, (err) => {
				if (err) {
					_cb(500, err);
				} else {
					_cb();
				}
			});			
		}
	],
	cb
	)
}



exports.queryOrder = (infos, cb) => {
	let condition = {};
	if (infos.status) {
		condition.status = infos.status;
	} else {
		condition.status = {$in : [3, 5]};
	}
	async.waterfall([
		(_cb) => {
			User.findOne({access_token: infos.access_token}, (err, doc) => {
				if (err) {
					_cb(500, err);
				} else if (!doc) {
					_cb(604);
				} else {
					_cb(null, doc);
				}					
			});
		},
		(user, _cb) => {
			condition.user_id = user.id;
			Order.count(condition, (err, count) => {
				if (err) {
	        		_cb(500, err);
	        	} else {
	        		_cb(null, count, user.end_time);
	        	}	
			});

		},
		(totalCount, end_time, _cb) => {
			Order.find(condition).skip(infos.start).limit(infos.num).sort({updatedAt: -1}).exec((err, doc) => {
	        	if (err) {
	        		_cb(500, err);
	        	} else {
	        		_cb(null, doc, totalCount, end_time);
	        	}				
			});			
		},
		(orders, totalCount, end_time, _cb) => {
			let tradeNOs = _.map(orders, 'out_trade_no');
			Trade.find({out_trade_no : {$in : tradeNOs}}, (err, doc) => {
				if (err) {
					_cb(500, err);
				} else {
					_cb(null, util.getOrderList(orders, doc), totalCount, end_time);
				}
			});
		}
	],
	cb
	)
}


exports.queryUserInfo = (infos, cb) => {
	async.waterfall([
		(_cb) => {
			User.findOne({access_token: infos.access_token}, (err, doc) => {
				if (err) {
					_cb(500, err);
				} else if (!doc) {
					_cb(604);
				} else {
					let leaguer = 0;
					let start_time = undefined;
					let end_time = undefined;
					if (doc.leaguer) {
						leaguer = doc.leaguer;
						start_time = doc.start_time.toFormat("YYYY-MM-DD HH24:MI:SS");
						end_time = doc.end_time.toFormat("YYYY-MM-DD HH24:MI:SS");
					}
					_cb(null, {
						id         : doc.id,
						type       : doc.type,
						leaguer    : leaguer,
						start_time : start_time,
						end_time   : end_time
					});
				}					
			});
		}
	],
	cb
	)
}