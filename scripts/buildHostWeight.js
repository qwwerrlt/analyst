'use strict';

const _ = require('lodash');
const request = require('request');
const async = require('async');

const _u = require('../common/util');
const HostWeight = _u.model('HostWeight');
const logger = _u.logger;

const url = 'http://api.91cha.com/alexa?key=6e6008980fd34062a73e768cf3affa07';

let hostList = require('./hostList.json');
hostList = [{
  "host": "10jqka.com.cn",
  "name": "同花顺"
}, {
  "host": "163.com",
  "name": "网易"
}, {
  "host": "baidu.com",
  "name": "百度新闻"
}, {
  "host": "caijing.com.cn",
  "name": "财经网"
}];

run();

function run() {
  let totalPV = 0;
  async.eachLimit(hostList, 100, (hostInfo, _cb) => {
    getDailyPV(hostInfo.host, (err, pv) => {
      if (err) return _cb(err)
      hostInfo.dailyPV = pv;
      totalPV += pv;
      console.log(`totalPV: ${totalPV}\n`);
      _cb();
    });
  }, (err) => {
    if (err) return logger.error(err);
    logger.info('get daily pv finished', new Date());

    async.eachLimit(hostList, 100, (hostInfo, _cb) => {
      let host = hostInfo.host;
      hostInfo.weight = hostInfo.dailyPV / totalPV; //算出权重
      console.log(`calculate weight: ${hostInfo.host} ${hostInfo.weight}`);
      HostWeight.update({host}, hostInfo, {upsert: true}, _cb);
    }, (err) => {
      if (err) return logger.error(err);
      console.log('success');
      logger.info('load weight finished', new Date());
    });
  });
}

function getDailyPV(host, cb) {
  request.get(`${url}&host=${host}`, (err, response, rawbody) => {
    if (err) return cb(err);
    let body = JSON.parse(rawbody);
    if (body.state !== 1) {//出错的时候直接返回
      logger.error(host, body);
      return cb(null, 0);
    }
    let pv;
    try {
      pv = body.data.daily_pv;
    } catch (e) {
      logger.error(host, body, e);
      return cb(null, 0);
    }
    console.log(host, pv);
    if (/\./.test(pv)) {
      logger.warn(`float pv occur: ${host} ${pv}`);
    }
    cb(null, isNaN(pv) ? 0 : ~~pv);
  });
}
/*
异常域名：
5200tv.com 187.2
cfen.com.cn 117.6
*/
