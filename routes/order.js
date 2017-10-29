'use strict';
const _       = require('lodash');
const config  = require('config');
const order   = require('../controllers/order.js');
const _u      = require('../common/util');
const logger  = _u.logger;
const ErrCode = config.ErrCode;
require('date-utils');

exports.aliNotify = function(request, response) {
	logger.info('aliNotify start ', request.body);
	if ('TRADE_SUCCESS' == request.body.trade_status) {
		order.aliNotify(request.body, (err) => {
			if (err) {
				logger.error('aliNotify finish ', err);
			} else {
				logger.info('aliNotify success');
			}
		});
	}
	response.end('success');
}

/**
 *   会员支付订单提交
 *   @params type          1 : 1M  2. 1Y  3 test
 *   @params access_token  登陆认证
 */
exports.submitOrder = function(request, response) {
	let data = _.assign(request.body, request.query);
	let TYPE = [0, 1, 2, 3];
	let errCode = 0;
	let infos = {};
	
	if (data.type && !isNaN(data.type) && TYPE[+data.type]) {
		infos.type = TYPE[+data.type];
	} else {
		errCode = 600;
	}
	let access_token = request.headers.access_token ? 
	 request.headers.access_token : data.access_token;
	if (!access_token) {
		errCode = 601;
	}
    logger.info('submitOrder start ', data, access_token);
	if (errCode) {
		response.status(200).send({
			status   : 501,
			message  : ErrCode[errCode]
		});
		return;
	}
	infos.access_token = access_token;

	order.submitOrder(infos, (err, ret) => {
		logger.info('submitOrder finish ', err, ret);
		if(err) {
			response.status(500).send({
				status   : 501,
				message  : ErrCode[err]
			});
		} else {
			response.status(200).send({
				status   : 200,
				message  : ret
			});
		}
	});
}

/**
 *   订单查询
 *   @params status        1.未支付订单 2.支付中 3.订单完成 4.订单取消 5、订单退款 6.订单异常 (默认查询3，5，6)
 *   @params access_token  登陆认证
 *   @params start         开始(默认0)
 *   @params num           数量(默认50)  
 */
exports.queryOrder = function(request, response) {
	let data = request.query;
	let STATUS = [0, 1, 2, 3, 4, 5, 6];
	let errCode = 0;
	let infos = {};
	
	if (data.status && !isNaN(data.status) && STATUS[+data.status]) {
		infos.status = STATUS[+data.status];
	} else {
		infos.status = 0;
	}

	if (data.start && !isNaN(data.start)) {
		infos.start =  parseInt(data.start);
	} else {
		infos.start = 0;
	}

	if (data.num && !isNaN(data.num)) {
		infos.num =  parseInt(data.num);
	} else {
		infos.num = 10;
	}

	let access_token = request.headers.access_token ? 
	 request.headers.access_token : data.access_token;

	if (!access_token) {
		errCode = 601;
	}

	logger.info('queryOrder start ', data, access_token);

	if (errCode) {
		response.status(200).send({
			status   : 501,
			message  : ErrCode[errCode]
		});
		return;
	}
	infos.access_token = access_token;

	order.queryOrder(infos, (err, doc, total_count, end_time) => {
		logger.info('queryOrder finish ', err, doc, total_count, end_time);
		if(err) {
			response.status(500).send({
				status   : 501,
				message  : ErrCode[err]
			});
		} else {
			let ret = {
				status      : 200,
				message     : doc,
				total_count : total_count				
			}
			if (end_time) {
				ret.end_time = end_time.toFormat('YYYY-MM-DD HH24:MI:SS');
				ret.timestamp = Math.round(end_time.getTime()/1000);
			}
			response.status(200).send(ret);
		}
	});
}


/**
 *   订单查询
 *   @params access_token  登陆认证 
 */
exports.queryUserInfo = function(request, response) {
	let data = request.query;
	logger.info('queryUserInfo start ', data);
	let errCode = 0;
	let infos = {};
	
	let access_token = request.headers.access_token ? 
	 request.headers.access_token : data.access_token;

	if (!access_token) {
		errCode = 601;
	}

	if (errCode) {
		response.status(200).send({
			status   : 501,
			message  : ErrCode[errCode]
		});
		return;
	}
	infos.access_token = access_token;

	order.queryUserInfo(infos, (err, ret) => {
		logger.info('queryUserInfo finish ', err, ret);
		if(err) {
			response.status(500).send({
				status   : 501,
				message  : ErrCode[err]
			});
		} else {
			response.status(200).send({
				status      : 200,
				message     : ret
			});
		}
	});
}