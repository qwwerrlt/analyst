'use strict';
const _ = require('lodash');
const request = require('request');
const async = require('async');

const _u = require('../common/util');
const EffectTopic = _u.model('EffectTopic');
const logger = _u.logger;
const hylanda = require('../common/hylanda');

let filterKey = process.argv[2];

run();

logger.info('get dpt data then process start...', {filterKey});

function run() {
  _u.mySeries({
    process: (_cb, ret) => {
      hylanda.processByActionTypeAndFilter('dpt', filterKey, _cb);
    },
  }, (err, ret) => {
    if (err) {
      console.log(err);
      console.log(err.stack);
      process.exit(1);
    } else {
      logger.info('get dpt data then process success...');
      process.exit(0);
    }
  });
}
