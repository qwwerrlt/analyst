'use strict';

const _ = require('lodash');
const _u = require('../common/util');
const Analyst = _u.model('Analyst');
const Report = _u.model('Report');
const AppErr = require('../common/AppErr');
const moment = require('moment');

//研究员列表的获取
exports.index = (req, res, next) => {
  let page = req.pageInfo.page;
  let pageNum = 10;

  //最新发布研报的研究员列表
  let latest = req.query.latest;
  if (latest === '1') {
    Analyst.find({
      winRate: {$gt: 0}, rank: {$gt: 0},
    }, null, {
      lean: true, limit: 20, skip: (page - 1) * 20,
      sort: {'latestReport.reportDate': -1, winRate: -1}
    }, (err, docs) => {
      if (err) return next(err);
      res.json(docs);
    });
    return;
  }
  //日期搜索
  let timestamp = req.query.timestamp;
  if (timestamp && /^1\d{9}$/.test(timestamp)) {
     Analyst.find({
	'latestReport.reportDate': {$gte: moment(timestamp * 1000).startOf('day'),
	                            $lte: moment(timestamp * 1000).endOf('day')}
     }, null, {
        lean: true, limit: pageNum, skip: (page - 1) * 20,
        sort: {winRate: -1}
     }, (err, docs) => {
        if (err) return next(err);
        res.json(docs);
     });
     return;
  }
  //关键词搜索
  let keyword = req.query.keyword;
  if (keyword) {
    keyword = keyword.replace(/[*{}|\[\]^&%#$*+]/g, '\\$&');
    let pattern = new RegExp(keyword);
    Analyst.find({name: pattern}, '_id name institute', (err, docs) => {
      if (err) return next(err);
      if (docs.length) {
        Analyst.update({name: docs[0].name},
	  {$inc: {searchTimes: 1}}, {multi: true}, (err, doc) => {
	     console.log(doc)
	})
      }
      res.json(docs);
    });
    return;
  }

  //搜索排行
  let hotSearch = req.query.hotSearch;
  if (hotSearch) {
     Analyst.find({winRate: {$gt: 0}, rank: {$gt: 0}},null, 
         {sort: {searchTimes: -1}, limit: 10}, (err, docs) => {
         if (err) return next(err);
         res.json(_.map(docs, 'name'));
     });
     return;
  }

  let IDs = req.query.IDs;
  if (IDs) {
     Analyst.find({_id: {$in: IDs.split(',')}}, null, {
       limit: pageNum, skip: (page - 1) * 20
     }, (err, docs) => {
         if (err) return next(err);
         res.json(docs);
     });
     return;
  }

  let monthsAgo = ~~req.query.monthsAgo;
  if (!monthsAgo) {//获取全部的列表
    Analyst.find(
      {rank: {$gt: (page - 1) * pageNum}}, null,
      {lean: true, limit: pageNum, sort: {rank: 1}},
      (err, docs) => {
        if (err) return next(err);
        res.json(docs);
      }
    );
    return;
  }

  //获取3个月或者6个月的列表
  if (monthsAgo !== 3 && monthsAgo !== 6) {
    return next(new AppErr('paramsError', null, {
      text: 'monthsAgo只能为3和6', monthsAgo
    }));
  }

  let monthsAgoDate = moment().subtract(monthsAgo, 'M');
  Analyst.find({
    'latestReport.reportDate': {$gt: monthsAgoDate}, total: {$gte: 10}
  }, null, {
    lean: true, limit: pageNum, skip: (page - 1) * pageNum, sort: {winRate: -1}
  }, (err, docs) => {
    if (err) return next(err);
    res.json(docs);
  });
};

exports.show = (req, res, next) => {
  let _id = req.params._id;
  console.log(_id)
  Analyst.count({}, (err, count) =>{
    console.log(count)
  })
  Analyst.findOne({_id}, (err, docs) => {
    if (err) return next(err);
    res.json(docs);
  });
};

//分析师推荐股票列表
exports.stocks = (req, res, next) => {
  let fiveYearsAgo = moment().subtract(5, 'y');
  let analystId = req.params._id;
  let threeDaysAgo = moment().subtract(3, 'd');
  Report.find({
    analystId,
    $or: [{
      reportDate: {$gte: fiveYearsAgo}, fRatio: {$ne: null}
    }, {
      reportDate: {$gte: threeDaysAgo},
    }],
  }, 'qmxReportId sName sCode reportDate maxRate', {
    lean: true, sort: {reportDate: -1}
  }, (err, docs) => {
    if (err) return next(err);
    res.json(docs);
  });
};
