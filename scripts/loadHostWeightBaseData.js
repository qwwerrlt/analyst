'use strict';

const _ = require('lodash');
const moment = require('moment');
const async = require('async');
const pinyin = require('pinyin');

const _u = require('../common/util');
const logger = _u.logger;
const loggerD = _u.loggerD;

const HostWeight = _u.model('HostWeight');

const datas = require('./hostWeightBaseData.json');
console.log(datas);

HostWeight.create(datas, (err, docs) => {
  if (err) return logger.error(err);
  console.log('success', docs.length);
});
