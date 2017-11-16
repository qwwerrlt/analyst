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

logger.info('dispatch topic resources start...', {filterKey});

function run() {
  _u.mySeries({
    buildAbnormalWordsMatchPattern: (_cb) => {
      hylanda.buildAbnormalWordsMatchPattern(_cb);//构造异动关键词匹配模式
    },
    buildHylandaId2eCodeMap: (_cb) => {
      hylanda.buildHylandaId2eCodeMap(_cb);
    },
    loadHostWeightMap: (_cb) => {
      hylanda.loadHostWeightMap(_cb);
    },
    buildStockNameMap: (_cb) => {
      hylanda.buildStockNameMap(_cb);
    },
    process: (_cb) => {
      hylanda.processByActionTypeAndFilter('info', filterKey, _cb);
    },
  }, (err, ret) => {
    if (err) {
      console.log(err);
      console.log(err.stack);
      process.exit(1);
    } else {
      logger.info('dispatch topic resources success');
      process.exit(0);
    }
  });
}
