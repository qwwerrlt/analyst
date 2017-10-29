'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const db = require('../common/connectMongo');

let schema = new Schema({
  sCode: {
    $type: String,
    required: true,
    unique: true,
  },
  sName: String,
  count: Number,//推荐该股票的研究员人数
  countRank: Number,
  analystIds: [ ObjectId ],
  reportIds: [ ObjectId ],
  forceIndex: Number,
  rank: Number,
  minFTargetPriceL: Number,//目标价下边界的前复权价格的最小值
  maxFTargetPriceH: Number,//目标价上边界的前复权价格的最大值
  someYearsReports: [{}],//内部格式见文件后面的注释
}, {collection: 'hot_stock', timestamps: true, typeKey: '$type'});

schema.index({rank: 1});
schema.index({countRank: 1});

module.exports = db.analyst.model('HotStock', schema);
/*
someYearsReports字段中的对象格式如下：
{
  "_id" : ObjectId("571c7ba5be6ce84069096fc3"),
  "qmxReportId" : 91605,
  "reportEndDate" : ISODate("2016-10-20T16:00:00Z"),
  "reportDate" : ISODate("2016-04-20T16:00:00Z"),
  "sCode" : "000778",
  "fTargetPriceH" : 6.5,//目标价上边界的前复权价格
  "fTargetPriceL" : 6.5,//目标价下边界的前复权价格
  "names" : [
    "衡昆"
  ],
  "analystIds" : [
    ObjectId("5715ab9d342eadf01f27ae3d")
  ],
  "photo" : "http://xxxxxxx/136385998053499930.jpg",
  "winRate" : 0 //胜率
}
*/
