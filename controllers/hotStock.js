'use strict';

const _ = require('lodash');
const _u = require('../common/util');
const HotStock = _u.model('HotStock');
const AppErr = require('../common/AppErr');

//热股列表
exports.index = (req, res, next) => {
  let page = req.pageInfo.page;
  let sortBy = req.query.sortBy;
  let pageNum = 20;
  let conditions = {};
  let options = {lean: true, limit: pageNum};
  if (sortBy === 'numAnalysts') {
    conditions.countRank = {$gt: (page - 1) * pageNum};
    options.sort = {countRank: 1};
  } else {
    conditions.rank = {$gt: (page - 1) * pageNum};
    options.sort = {rank: 1};
  }
  HotStock.find(
    conditions, '-analystIds -reportIds -someYearsReports', options,
    (err, docs) => {
      if (err) return next(err);
      res.json(docs);
    }
  );
};

exports.show = (req, res, next) => {
  let sCode = req.params.sCode;
  HotStock.findOne({sCode}, (err, doc) => {
    if (err) return next(err);
    res.json(doc);
  });
};

exports.showReports = (req, res, next) => {
  let _id = req.params._id;
  HotStock.findOne({_id}, 'someYearsReports', {lean: true}, (err, doc) => {
    if (err) return next(err);
    res.json(doc.someYearsReports);
  });
};

exports.showReportsV2 = (req, res, next) => {
  let sCode = req.params.sCode;
  let monthsAgo = req.query.monthsAgo;
  let Model = _u.model('StockReport' + (monthsAgo ? '6' : ''));
  Model.find(
    {sCode}, null, {sort: {'reports.reportDate': -1}, lean: true},
    (err, docs) => {
      if (err) return next(err);
      res.json(docs);
    }
  );
};
