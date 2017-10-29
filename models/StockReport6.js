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
  sCode: String,//股票代码
  name:  String,//研究员名称
  winRate: Number,//研究员胜率
  photo2: String,//研究院头像
  reports: [{}],//格式请查阅注释
}, {collection: 'stock_report6', timestamps: true, typeKey: '$type'});

schema.index({sCode: 1});

module.exports = db.analyst.model('StockReport6', schema);
/*
report的结构如下：
{
  "qmxReportId" : 226699,
  "fTargetPriceL" : 17.94801901743265,
  "fTargetPriceH" : 17.94801901743265,
  "reportDate" : ISODate("2011-06-28T16:00:00Z")
}
*/
