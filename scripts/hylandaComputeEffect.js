'use strict';
const _ = require('lodash');
const async = require('async');
const moment = require('moment');

const _u = require('../common/util');
const logger = _u.logger;

const hylanda = require('../common/hylanda');
const redisService = _u.service('redis');

let filterKey = process.argv[2];

run();

logger.info('compute effect start...', {filterKey});

function run() {
  _u.mySeries({
    weightMap: (_cb) => {
      hylanda.loadHostWeightMap(_cb);
    },
    compute: (_cb) => {
      hylanda.processByActionTypeAndFilter('effect', filterKey, _cb);
    },
  }, (err, ret) => {
    if (err) {
      console.log(err);
      console.log(err.stack);
      process.exit(1);
    } else {
      logger.info('compute effect success');
      process.exit(0);
    }
  });
}
