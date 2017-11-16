'use strict';

const _ = require('lodash');
const async = require('async');
const csv = require('csv');
const fs = require('fs');
const hylanda = require('../common/hylanda');

const _u = require('../common/util');
const logger = _u.logger;

if (process.argv.length < 3) {
  console.log('Usage: node scripts/createStocksTopic.js <csv file>');
  process.exit(1);
}

let csvFile = process.argv[2];

_u.mySeries({
  data: (_cb) => {
    fs.readFile(`./scripts/${csvFile}.csv`, 'utf-8', _cb);
  },
  lines: (_cb, ret) => {
    csv.parse(ret.data, _cb);
  },
  datas: (_cb, ret) => {
    _cb(null, _.map(ret.lines, (line) => {
      let name = line[1].replace(/[ *_\-]/g, '');
      return {
        rid: line[0] + '.stk',
        rtype: 'stock',
        topicName: 'tj' + name,
        keyword: {
          force: name,
          similar: name,
        },
      };
    }));
  },
  create: (_cb, ret) => {
    hylanda.createTopics(ret.datas, _cb);
  },
}, (err, ret) => {
  if (err) {
    logger.error(err);
  } else {
    console.log(ret.datas);
    console.log('create success...');
  }
});
