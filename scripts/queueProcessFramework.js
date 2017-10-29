'use strict';

const _ = require('lodash');
const async = require('async');

const _u = require('../common/util');
const logger = _u.logger;
const dzh = require('../common/dzh');

module.exports = function(Model, conditions, processDocFunc) {
  return function(cb) {
    let queue = async.queue(function(doc, _cb) {
      processDocFunc(doc, _cb);
    }, 100);

//    let cursor = Model.find(conditions).limit(1).stream();
    let cursor = Model.find(conditions).stream();

    queue.drain = function() {
      if (cursor.paused) {
        cursor.resume();
      }
    };

    var i = 0;
    cursor.on('data', function (doc) {
      console.log(i++);
      queue.push(doc, queueMemberProcessedHandler);
      if (queue.length() >= _u.bulkSize) {
        cursor.pause();
      }
    });
    cursor.on('error', cb);
    cursor.on('end', function () {
      console.log('end');
      queue.drain = cb;
    });
  };
};

//队列成员处理完成后需要进行的操作，一般啥都不用执行
function queueMemberProcessedHandler(err) {
  if (err) logger.error(err);
}
