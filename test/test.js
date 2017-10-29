'use strict';
//http://pay.onehou.com/order/submit/ali?type=1&access_token=69KIbV3I2gE/TUa/YocAdQ==
//http://pay.onehou.com:8080/order/query/ali?access_token=UsidrCn41KmZjgbsSJ006g==
//http://pay.onehou.com:8080/user/info/query?access_token=UsidrCn41KmZjgbsSJ006g==
//console.log('http://pay.onehou.com:8080/order/query/ali?access_token=' + encodeURIComponent('a2ee+JxeDvz+CDOsSttnkQ=='))
//curl -H "access_token:69KIbV3I2gE/TUa/YocAdQ==" 127.0.0.1:8080/order/query/ali
//curl -H "access_token:a2ee+JxeDvz+CDOsSttnkQ==" http://pay.onehou.com/order/submit/ali?type=1
console.log(encodeURIComponent('69KIbV3I2gE/TUa/YocAdQ=='))
const request = require('request');

let data = {
	  gmt_create: '2017-09-12 10:00:00',
	  charset: 'utf-8',
	  seller_email: 'whkj201607@163.com',
	  subject: '会员开通',
	  body: '会员*1月',
	  buyer_id: '2088502117354451',                     //买家支付宝用户号
	  invoice_amount: '88.00',                          //开票金额
	  notify_id: '068e0f16516bf560ab8bd7fa30f8d9ajh2',  //通知校验ID
	  fund_bill_list: '[{"amount":"0.01","fundChannel":"ALIPAYACCOUNT"}]',
	  notify_type: 'trade_status_sync',          
	  trade_status: 'TRADE_SUCCESS',             
	  receipt_amount: '0.01',                    //实收金额
	  app_id: '2017021705719543',                //付款金额
	  buyer_pay_amount: '0.01',
	  seller_id: '2088421543536184',             //卖家支付宝用户号
	  gmt_payment: '2017-08-26 18:17:23',        //交易付款时间
	  notify_time: '2017-08-27 18:41:16',        //通知时间
	  version: '1.0',
	  out_trade_no: '300001008C1B36B2A7590000',
	  total_amount: '0.01',                      //订单金额
	  trade_no: '2017082621001004450271683833',
	  auth_app_id: '2017021705719543',           //appid
	  buyer_logon_id: 'mic***@gmail.com',        //买家支付宝账号
	  point_amount: '0.00',                      //集分宝金额
	  sign_type : 'RSA2',
	  sign : 'ie6v/VssTL/zxVwXoS04Dc2uAiHN510QP5Rj1yHKvsofYEk8SN684swZlIzwEGGz5zwhVxLsqqX6ZxnpL7HQQmlHBxRv+06/fUXCdqJVzQmi/lAGgBGu7he1eZu8vy/s2w26j+PKj+LrzFTwlCqA9muJzxydkqKubKAf0z2tpcIuiB82+p/hhVltB+Hh0LtwBI+BMhxVY/Pw0IIb+2IRwoq42mE1CPSYXR/u/mr6xS9135Vdk/0VbEYR/Moz+oiQfaJ6bj+H5Vz6XUzkoHweLo7bbOgYiGiOz8AbXu6RAQmU5++H2wnksSk+J5JX/8VQlQcf1B5UguocNV4dW8gZQQ=='
}

//request({
// 	url: 'http://127.0.0.1:8080/notify/ali',
// 	method: 'POST',
// 	headers: {
//         "Content-Type": "application/json; charset=utf-8"
//     },
//     body: JSON.stringify(data)
// }, (err, res, body) => {
// 	console.log(body)
// });