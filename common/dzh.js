'use strict';

const _ = require('lodash');
const moment = require('moment');
const AppErr = require('./AppErr');
const _u = require('./util');
const logger = _u.logger;
const eLog = _u.eLog;
const loggerD = _u.loggerD;
const request = require('request');
const appid = 'dcdc435cc4aa11e587bf0242ac1101de';
const secretKey = 'InsQbm2rXG5z';

const host = 'http://gw.yundzh.com';

let tokenUrl = `${host}/token/access?appid=${appid}&secret_key=${secretKey}`;
let rangeUrl = `${host}/sort/range`;
let dataUrl = `${host}/stkdata`;
let blockUrl = `${host}/block/obj`;
let klineUrl = `${host}/quote/kline`;
let ggtzybUrl = `${host}/forecasts/ggtzyb`;

function requestDZH(options, cb) {
  options.json = true;
  request.get(options, (err, response, body) => {
    if (err) return cb(err);
    if (body && body.Err === 0 && body.Data) {
      return cb(null, body.Data);
    }

    logger.error(options, body);
    cb(new AppErr('dzhError', null, body));
  });
}

function getAccessToken(cb) {
  let options = {url: tokenUrl};
  requestDZH(options, (err, data) => {
    if (err) return cb(err);
    logger.info('request dzh response token:', data.RepDataToken[0]);
    cb(null, data.RepDataToken[0].token);
  });
};
exports.getAccessToken = getAccessToken;


function getReportKline(token, report, cb) {
  let options = {
    obj: `${_u.getPrefixForStkCode(report.sCode)}${report.sCode}`, token,
    begin_time: formatDZHTime(report.reportDate),
    end_time:   formatDZHTime(report.reportEndDate),
  };
  getKline(options, cb);
}
exports.getReportKline = getReportKline;

function getFPriceRCAndDate(token, report, cb) {
  //end_time设为报告日，最后一条kline数据即为报告日价格
  let options = {
    obj: `${_u.getPrefixForStkCode(report.sCode)}${report.sCode}`, token,
    end_time: formatDZHTime(moment(report.reportDate)), start: -1, count: 1
  };
  console.log(options)
  getKline(options, (err, kline) => {
    if (err) return cb(err);
    console.log('lookBackToGetFPriceRCAndDate:', report._id);
    console.log(kline)
    let index = kline.data.length - 1;
    cb(null, buildFPriceRCAndDate(kline.data, index));
  });
}
exports.getFPriceRCAndDate = getFPriceRCAndDate;

function formatDZHTime(date) {
  return moment(date).format('YYYYMMDD') + '-000000-000-8';
}

function getKline(options, cb) {
  let qs = _.extend({
    period: '1day', split: 1, field: 'ShiJian,ZuiGaoJia,ZuiDiJia,ShouPanJia',
  }, options);
  requestDZH({url: klineUrl, qs}, (err, data) => {
    if (err) return cb(err);
    let result = _.get(data, 'JsonTbl.data[0][0].data[0][1]', {});
    if (_.isEmpty(result)) {
      eLog('dzhEmptyKlineError', qs);
      return cb(new AppErr('dzhEmptyKlineError'));
    }
    cb(null, result);
  });
}
exports.getKline = getKline;

function buildFPriceRCAndDate(klineData, index) {
  return {
    fPriceRC: klineData[index][3],//收盘价
    fPriceRCDate: new Date(klineData[index][0] * 1000),//秒转化为毫秒
  };
}
exports.buildFPriceRCAndDate = buildFPriceRCAndDate;
