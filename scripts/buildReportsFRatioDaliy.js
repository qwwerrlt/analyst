'use strict';

const _ = require('lodash');
const async = require('async');
const moment = require('moment');

const _u = require('../common/util');
const logger = _u.logger;
const dzh = require('../common/dzh');
const Report = _u.model('Report');
const queueProcessFramework = require('./queueProcessFramework');

run();

function run() {
  _u.mySeries({
    token: (_cb) => {
      dzh.getAccessToken(_cb);
//      _cb(null, '00000010:1461470182:a6d3a22e801a0505821b18358e56b0e869950da9');
    },
    process: (_cb, ret) => {
      queueProcessFramework(Report, {
        reportDate: {$gte: moment().subtract(6, 'M')},
//        updatedAt: {$lt: new Date('2016-04-26 16:40:53.557')},
      }, buildProcessReportFunc(ret.token))(_cb);
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
/*
处理逻辑应该做如下优化：
所有6个月以内的研报，首先检查fRatio，如果该字段存在，则表示已经取得研报当日的前复权价格，并且已经获得最高价和最低价，所以只需要去取今天的行情，进行对比，就可以更新相关字段。
如果不存在fRatio，则需要走完整的取数据流程
 */

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
  report.save(cb);
}

function getMinAndMaxPrice(klineData) {
  return {
    max: _.maxBy(klineData, (line) => { return line[1]})[1],//最高价
    min: _.minBy(klineData, (line) => { return line[2]})[2],//最低价
  };
}

