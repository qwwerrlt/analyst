'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const db = require('../common/connectMongo');

let schema = new Schema({
  name: String,     //姓名
  photo: String,    //头像
  sex: String,      //性别
  education: String,//学历
  certificateNum: { //证书编号，唯一
    $type: String,
    unique: true,
    required: true,
  },
  stars: [ Number ],     //所获奖项
  institute: String,     //执业机构
  history: [{
    certificateNum: String,
    institute: String,
    positionName: String,
    startTime: Date,
    endTime: Date,
  }],   //历史执业机构
  instituteShort: String,//执业机构简称
  positionName: String,  //职业岗位
  cfBeginDate: Date,     //证书取得日期
  cfEndDate: Date,       //证书有效截止日期
  cfStatus: String,      //证书状态
  numOfchange: Number,   //变更次数
  //引用ID 下面链接加上rpiId可以查看改研究员信息
  //http://person.sac.net.cn/pages/registration/sac-finish-person.html?rpiId=
  rpiId: String,
  win: Number,    //胜的数量
  lose: Number,   //败的数量
  total: Number,  //总共推荐数量 (win + lose)
  winRate: Number,//胜率，也就是挣钱啦 (win / total)
  rank: {         //排名，根据胜率倒排
    $type: Number,
    index: true,
    sparse: true, //建立稀疏索引，值为null的不参与排名
  },
  minRateStock: {},//推荐最失败的股票
  maxRateStock: {},//推荐最成功的股票
  searchTimes: Number,
  latestReport: {
    sName: String,
    sCode: String,
    maxRate: Number,
    reportDate: Date,
    fPriceRC: Number,
    fTargetPriceL: Number,
    fTargetPriceH: Number,
  },//最新的研报信息
}, {collection: 'analyst', timestamps: true, typeKey: '$type'});

schema.index({'latestReport.reportDate': 1});
module.exports = db.analyst.model('Analyst', schema);
