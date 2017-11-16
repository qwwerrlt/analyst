'use strict';

const redisdb = require('../common/redis');
const analystRedis  = redisdb.analyst;
const dataRedis     = redisdb.data;
const redisKey = {
  verifyCode: (mobile) => { return `verify:${mobile}`; },
  effect: (hylandaId) => { return `effect:${hylandaId}`; },
  effectRank: () => { return `er:${_u.formatDate()}`; },
  hostCountMap: (hylandaId) => {
    return `hostCount:${_u.formatDate()}:${hylandaId}`;
  },//hostCount:20160315:10731068921003
  sourceTypeCount: (hylandaId) => {
    return `sourceTypeCount:${hylandaId}`;
  },//sourceTypeCount:10731068921003
  dptUrlCrcs: (hylandaId) => { return `dpt:${hylandaId}:urlCrcs`; },
  dptReducedCount: 'dpt:reducedCount',
  dptTotalCount: (hylandaId) => { return `dpt:${hylandaId}:totalCount`; },
  goOnUpdateCount: (hylandaId) => {
    return `dpt:${hylandaId}:goOnUpdateCount`;
  },
  register: (date) => { return `r:${date}`; },
  login: (date) => { return `l:${date}`; },
  retention: (date, count) => { return `rt:${date}:${count}`; },
};

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

exports.getHostWeightMap = (cb) => {
  getKey2NumberValueMap('hostWeightMap', makeCallbackConvertS2N(cb));
};

exports.setHostWeightMap = (hostWeightMap, cb) => {
  dataRedis.hmset('hostWeightMap', hostWeightMap, cb);
};

function getKey2NumberValueMap(hkey, cb) {
  dataRedis.hgetall(hkey, makeCallbackConvertS2N(cb));
}

function makeCallbackConvertS2N(cb) {//convert string to number
  return (err, map) => {
    if (err) return cb(err);
    _.each(map, (value, key) => {
      map[key] = +value;
    });
    cb(null, map);
  };
}

exports.getHostCountMap = (hylandaId, cb) => {
  getKey2NumberValueMap(redisKey.hostCountMap(hylandaId), cb);
};

exports.incrHostCount = (hylandaId, infoHostCount, cb) => {
  incrCount(hylandaId, redisKey.hostCountMap, infoHostCount, cb);
};

function incrCount(hylandaId, generateKeyFunc, countMap, cb) {
  let hkey = generateKeyFunc(hylandaId);
  async.forEachOf(countMap, (count, key, _cb) => {
    dataRedis.hincrby(hkey, key, count, _cb);
  }, cb);
}

exports.getDptReducedCount = (hylandaId, cb) => {
  dataRedis.hget(redisKey.dptReducedCount, hylandaId, cb);
};

exports.sumGoOnUpdateCount = (hylandaId, cb) => {
  let hkey = redisKey.goOnUpdateCount(hylandaId);
  dataRedis.hvals(hkey, (err, values) => {
    if (err) return cb(err);
    cb(null, _.sumBy(values, parseInt));
  });
};

exports.setDptTotalCount = (hylandaId, count, cb) => {
  let hkey = redisKey.dptTotalCount(hylandaId);
  dataRedis.hset(hkey, _u.formatDate(), count, cb);
};

exports.getYesterdayTotalCount = (hylandaId, cb) => {
  let yesterday = moment().subtract(1, 'd').format('YYYYMMDD');
  dataRedis.hget(redisKey.dptTotalCount(hylandaId), yesterday, cb);
};

exports.hsetEffect = (hylandaId, value, cb) => {
  dataRedis.hset(redisKey.effect(hylandaId), _u.formatDate(), value, cb);
};

exports.zaddEffect = (rid, value, cb) => {
  dataRedis.zadd(redisKey.effectRank(), value, rid, cb);
};

exports.zscanUrlCrcs = (hylandaId, cursor, cb) => {
  let key = redisKey.dptUrlCrcs(hylandaId);
  dataRedis.zscan(key, cursor, 'count', 90, (err, result) => {
    if (err) return cb(err);
    cursor   = result[0];
    let list = _.filter(result[1], function(value, index) {
      return index % 2 === 0;
    });
    cb(null, [cursor, list]);
  });
};