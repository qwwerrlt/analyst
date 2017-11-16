'use strict';

const _ = require('lodash');

const _u = require('../common/util');
const HostWeight = _u.model('HostWeight');
const redisService = _u.service('redis');

_u.mySeries({
  weightMap: (_cb) => {
    buildHostWeightMap(_cb);
  },
  saveToRedis: (_cb, ret) => {
    redisService.setHostWeightMap(ret.weightMap, _cb);
  },
}, (err) => {
  if (err) return console.log(err);
  console.log('success');
});

function buildHostWeightMap(cb) {
  _u.mySeries({
    docs: (_cb) => {
      HostWeight.find(_cb);
    },
  }, (err, ret) => {
    if (err) return cb(err);
    let result = {};
    _.each(ret.docs, (doc) => {
      result[doc.host] = doc.weight;
    });
    cb(null, result);
  });
}
