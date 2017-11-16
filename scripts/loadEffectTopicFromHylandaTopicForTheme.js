'use strict';

const _ = require('lodash');
const async = require('async');
const csv = require('csv');
const fs = require('fs');

const _u = require('../common/util');
const logger = _u.logger;
const EffectTopic = _u.model('EffectTopic');

_u.mySeries({
  data: (_cb) => {
    fs.readFile('./scripts/hylandaTopicForTheme.csv', 'utf-8', _cb);
  },
  lines: (_cb, ret) => {
    csv.parse(ret.data, _cb);
  },
  datas: (_cb, ret) => {
    _cb(null, _.map(ret.lines, (line) => {
      return {
        topicName: line[0],
        hylandaId: line[1],
        rid: `B$${line[2]}.index`,
        nextId: _u.initNextId(),
      };
    }));
  },
  create: (_cb, ret) => {
    EffectTopic.create(ret.datas, _cb);
  },
}, (err, ret) => {
  if (err) {
    logger.error(err);
  } else {
    console.log('create success...');
  }
});
