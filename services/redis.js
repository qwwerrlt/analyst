'use strict';

const redisdb = require('../common/redis');
const analystRedis  = redisdb.analyst;
const dataRedis     = redisdb.data;

exports.setAnalystIds = (key, IDs, cb) => {
  analystRedis.sadd(`analyst:${key}`, IDs, cb);
};

exports.popAnalystIds = (key, count, cb) => {
  analystRedis.spop(`analyst:${key}`, count, cb);
};

exports.getAnalystNum = (cb) => {
  analystRedis.scard('analyst:rpiIds', cb);
};

exports.getAnalystReportNextId = (cb) => {
  dataRedis.get('analystReportNextId', cb);
};

exports.setAnalystReportNextId = (value, cb) => {
  dataRedis.set('analystReportNextId', value, cb);
};
