'use strict';
const _ = require('lodash');
const async = require('async');
const moment = require('moment');

const _u = require('../common/util');
const logger = _u.logger;

const hylanda = require('../common/hylanda');

logger.info('----------BEGIN create effect topic success BEGIN----------');

let datas = [{ 'rid' : '56efb3d7e3f7adcd1a889890', 'topicName' : '苹果新品本周亮相产业链公司遇契机', 'keyword' : { 'force' : '苹果新品', 'similar' : 'A股,上市公司', 'antonym' : '' }}];

run();

function run() {
  _u.mySeries({
    create: (_cb) => {
      hylanda.createTopics(datas, _cb);
    },
  }, (err, ret) => {
    if (err) {
      console.log(err);
      console.log(err.stack);
    }
    logger.info('----------END create effect topic success END----------');
  });
}

