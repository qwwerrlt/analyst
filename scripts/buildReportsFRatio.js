'use strict';

const _ = require('lodash');
const async = require('async');
const moment = require('moment');

const _u = require('../common/util');
const logger = _u.logger;
const dzh = require('../common/dzh');
const Report = _u.model('Report');
const queueProcessFramework = require('./queueProcessFramework');

let years = 1;

let conditions = null;
if (process.argv[2]) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(process.argv[2])) {
    let dateStr = process.argv[2]
    conditions = {reportDate: {
      $gte: moment(dateStr, 'YYYY-MM-DD').subtract(years, 'y'),
      $lte: moment(dateStr, 'YYYY-MM-DD'),
    }};
  } else {
    console.log('Usage: node buildReportsFRatio.js [dateStr]');
    console.log('  e.g. node buildReportsFRatio.js 2010-04-01');
    process.exit(1);
  }
} else {
  conditions = {reportDate: {$gte: moment().subtract(years, 'y')}};
}

console.log(conditions);

run();

function run() {
  _u.mySeries({
    token: (_cb) => {
      dzh.getAccessToken(_cb);
//      _cb(null, '00000010:1461470182:a6d3a22e801a0505821b18358e56b0e869950da9');
    },
    process: (_cb, ret) => {
      queueProcessFramework(
        Report, conditions, buildProcessReportFunc(ret.token)
      )(_cb);
    },
  }, (err, ret) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    } else {
      logger.info('buildReportMinAndMaxPrice: SUCCESS');
      setTimeout(() => {
        process.exit(0);
      }, 10000);
    }
  });
}

function buildProcessReportFunc(token) {
  return function(report, cb) {
    _u.mySeries({
      kline: (_cb) => {
        dzh.getReportKline(token, report, _cb);
      },
      fPriceRCAndDate: (_cb, ret) => {//复权相关
        //如果报告日当天有交易收盘价，则直接取值，否则，从kline中回溯
        if (ret.kline.data[0][0] * 1000 === +moment(report.reportDate)) {
          console.log('getFPriceRCAndDate:', report._id);
          return _cb(null, dzh.buildFPriceRCAndDate(ret.kline.data, 0));
        }

        dzh.getFPriceRCAndDate(token, report, _cb);
      },
      update: (_cb, ret) => {
        updateReport(report, ret.fPriceRCAndDate, ret.kline.data, _cb);
      },
    }, cb);
  };
}

function updateReport(report, fPriceRCAndDate, klineData, cb) {
  report.fPriceRC     = fPriceRCAndDate.fPriceRC;
  report.fPriceRCDate = fPriceRCAndDate.fPriceRCDate;

  report.fRatio = report.priceRC / report.fPriceRC;

  report.fTargetPriceL = report.targetPriceL / report.fRatio;
  report.fTargetPriceH = report.targetPriceH / report.fRatio;

  let minAndMaxPrice = getMinAndMaxPrice(klineData);
  report.fMinPrice = minAndMaxPrice.min;
  report.fMaxPrice = minAndMaxPrice.max;
  report.minRate = (report.fMinPrice / report.fPriceRC - 1) * 100;
  report.maxRate = (report.fMaxPrice / report.fPriceRC - 1) * 100;

  if (report.fMaxPrice > report.fTargetPriceL) report.winFlag = true;

//  console.log(report); cb();
  Report.update({_id: report._id}, report, cb);
}

function getMinAndMaxPrice(klineData) {
  return {
    max: _.maxBy(klineData, (line) => { return line[1]})[1],//最高价
    min: _.minBy(klineData, (line) => { return line[2]})[2],//最低价
  };
}
