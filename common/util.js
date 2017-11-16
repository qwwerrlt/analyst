'use strict';

const _ = require('lodash');
const moment = require('moment');
const async = require('async');
const utf8 = require('utf8');
require('date-utils');
const crypto = require('crypto');
const loggerConf = require('./initLogger');

exports.logger  = loggerConf.logger;
exports.loggerD = loggerConf.loggerD;
exports.eLog    = loggerConf.eLog;


function timestamp() {
  return Date.now() / 1000 | 0;
}
exports.timestamp = timestamp;

exports.model = (name) => {
  return require(`../models/${name}`);
};

exports.service = (name) => {
  return require(`../services/${name}`);
};

exports.mySeries = (tasks, callback) => {
  let prev;
  for (let i in tasks) {
    let task = tasks[i];
    if (prev) {
      tasks[i] = [prev, task];
    } else {
      tasks[i] = task;
    }
    prev = i;
  }
  async.auto(tasks, callback);
};

exports.bulkSize = process.env.NODE_ENV === 'production' ? 1000 : 10;

exports.getPrefixForStkCode = (code) => {
  return /^6/.test(code) ? 'SH' : 'SZ';
};

let record = {};
exports.getID = (name, cb) => {
    let buf  = new Buffer(12);
    let host = 1;
    let pid  = process.pid;
    let time = Math.round((new Date).getTime()/1000);

    if (record[name] == null) record[name] = {time:0, seq:0};
    if (record[name].time != time){
        record[name].time = time;
        record[name].seq  = 0;
    } else{
        record[name].seq++;
    }
    var seq = record[name].seq;
    var pname = name+"\0";
    buf.write(pname, 0, 2);
    buf.writeUInt16LE(host, 2);
    buf.writeUInt16LE(pid&0xffff, 4);
    buf.writeUInt32LE(time, 6);
    buf.writeUInt16LE(seq, 10);
    var id = buf.toString("hex").toUpperCase();
    if(cb) cb(id);
    else return id;
}

exports.getOrderList = (orders, trades) => {
    let STATUS  = ['初始化', '待支付', '支付中', '已支付', '取消支付', '已退款', '支付异常'];
    let PAYTYPE = ['未知', '微信', '支付宝'];
    let TYPE    = ['未知', '月卡', '年卡', '测试'];
    return _.map(orders, (order) => {
        let trade = _.find(trades, _.matchesProperty('out_trade_no', order.out_trade_no));
        let pay_type = null;
        let payment_time = null;
        if (trade) {
            pay_type     = PAYTYPE[trade.pay_type];
            payment_time = trade.payment_time.toFormat('YYYY-MM-DD HH24:MI:SS');
        }
        return {
            type           : TYPE[order.type],
            total_amount   : order.total_amount,
            status         : STATUS[order.status],
            out_trade_no   : order.out_trade_no,
            pay_type       : pay_type,
            payment_time   : payment_time
        }
    })
}

exports.initNextId = () => {
  return moment().format('YYYY_MM_DD') + '0';
};

function md5(str) {
  return crypto.createHash('md5').update(utf8.encode(str)).digest('hex');
}
exports.md5 = md5;
