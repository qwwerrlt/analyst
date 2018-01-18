'use strict';

const _ = require('lodash');
const _u = require('./common/util');
const dzh = require('./common/dzh');
const moment = require('moment');
const Report = _u.model('Report');
let token = null;
let report = null;
  _u.mySeries({
    token: (_cb) => {
      dzh.getAccessToken(_cb);
    },
    data: (_cb, ret) => {
  	  token = ret.token;
  	  Report.findOne({_id:'5a4b3c3fce51eaec7c61a1ec'}, _cb);
    },
    kline: (_cb, ret) => {
      report = ret.data;
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
      console.log(ret.fPriceRCAndDate);
      updateReport(report, ret.fPriceRCAndDate, ret.kline.data, _cb);
    },
  }, (err, ret) => {
  	//console.log(err);
  });



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
