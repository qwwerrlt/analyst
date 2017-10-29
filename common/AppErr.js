'use strict';

let util = require('util');

let msg = {
  paramsError: '参数错误',
  paramsMissing: '缺少参数',
  paramsLengthError: '参数长度错误',

  userActionCount: '用户实际自选的长度和请求的长度不同',

  codeNotExist: '验证码不存在或已失效，请重新请求',
  codeNotMatch: '验证码不匹配，请重新输入',

  notFound: '没找到',
  unauthorized: 'token无效',
  noUserForThisToken: '这个token没有对应的用户',

  smsError: '短信服务错误',
  dzhError: '大智慧接口错误',
  dzhEmptyKlineError: '大智慧kline为空错误',
  dzhEmptyForecastsError: '大智慧研报为空错误',

  alidayuErr: '大鱼接口返回错误',

  effectError: '全网影响力接口错误',
  hylandaError: '海量响应错误',

  illegalActionType: '非法操作类型',
  illegalECode: '非法外码',
  illegalMarket: '非法市场，仅支持HK US HQ',
  illegalTime: '非法时间参数',

  shouldNotBeHere: '不该到这里来',

  systemError: '系统错误',

  undefinedUnionid: '微信用户没有unionid',

  illegalLevel: '用户等级不符合要求',

  illegalInvitation: '邀请码无效',

  priceInvalid: '价格不正确',
};

let AppErr = function(errcode, httpStatus, more) {
  Error.call(this, errcode);
  Error.captureStackTrace(this, this.constructor);
  this.message = errcode;
  this.status = httpStatus || 400;
  this.errtext = msg[errcode] || '抱歉，遇到未知错误，请重试';
  this.more = more;
};

util.inherits(AppErr, Error);

module.exports = AppErr;

