'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const db = require('../common/connectMongo');

let schema = new Schema({
  analystId: {
    $type: ObjectId,
    required: true,
  },
  qmxReportId: {//启明星数据库中的报告id，用于查询报告详细内容
    $type: Number,
    required: true,
  },
  sName: {
    $type: String,
    required: true,
  },
  sCode: {
    $type: String,
    required: true,
  },
  priceRC: {
    $type: Number,
    required: true,
  },
  targetPriceL: Number,
  targetPriceH: Number,
  fPriceRC: Number,  //报告日价格的前复权价格
  fPriceRCDate: Date,//前复权价格所属的日期
  fRatio: Number,    //前复权系数， fRatio = priceRC / fPriceRC;
  fTargetPriceL: Number,//目标价下边界的前复权价格
  fTargetPriceH: Number,//目标价上边界的前复权价格
  reportDate: Date,   //报告日
  reportEndDate: Date,//报告失效日，与reportDate组成了报告观察范围
  fMinPrice: Number,//最低价
  fMaxPrice: Number,//最高价
  minRate: Number, //最小涨幅，即最大跌幅
  maxRate: Number, //最大涨幅
  winFlag: {       //胜败标记，表示这份报告的预测算成功还是失败
    $type: Boolean,
    default: false,
  },
}, {collection: 'report', timestamps: true, typeKey: '$type'});

schema.index({analystId: 1, qmxReportId: 1}, {unique: true});
schema.index({reportDate: 1});

module.exports = db.api.model('Report', schema);

