'use strict';
const mssql = require('mssql');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');

const _u = require('../common/util');
const logger = _u.logger;
const loggerD = _u.loggerD;

const redisService = _u.service('redis');
const Report = _u.model('Report');
const Analyst = _u.model('Analyst');
const ratio = require('./ratioTableOfGradeC.json');
const isOrgNameChanged = require('./orgNameChangedList.json');


function run() {
  _u.mySeries({
    connect: (_cb) => {
      require('../common/mssql')(_cb);
    },
    analystMap: (_cb) => {
      buildAnalystMap(_cb);
    },
    nextId: (_cb) => {
      redisService.getAnalystReportNextId(_cb);
    },
    process: (_cb, ret) => {
      getReportsThenProcess(ret.nextId || 0, ret.analystMap, _cb);
    },
  }, (err, ret) => {
    if (err) {
      logger.error(err);
      logger.error(err.stack);
    } else {
      logger.info('build reports completed: SUCCESS');
    }
  });
}
exports.run = run;
function buildAnalystMap(cb) {
  let map = {};
  let count = 0;
  async.during(
    (_cb) => {
      Analyst.find({}, 'name institute stars history', {skip: count, limit: 300}, (err, analysts) => {
        if (err) return cb(err);
        if (analysts.length) {
           _.each(analysts, (analyst) => {
            if (_.isEmpty(analyst.history)) {
              map[`${analyst.institute}:${analyst.name}`] = analyst;
            } else {
              _.each(analyst.history, (item) => {
                map[`${item.institute}:${analyst.name}`] = analyst;
              });
            }
          });
          _cb(null, true);        
        } else {
          _cb(null, false);
        }
        count += 300;
      });
    },
    (_cb) => {
      console.log(`the size of map is ${_.size(map)}`);
      _cb();
    },
    (err) => {
      if (err) return cb(err);
      cb(null, map);
    }
  );
}

function buildReportData(report) {
  let data = {
    sName:         report.SName,
    sCode:         report.StkCode,
    priceRC:       report.PriceRC,
    targetPriceL:  report.TargetPriceL,
    targetPriceH:  report.TargetPriceH,
    reportDate:    moment(report.ReportDate).startOf('d'),
    reportEndDate: moment(report.ReportDate).add('6', 'M').startOf('d'),
  };
  return data;
}

function getReportsByNextId(nextId, cb) {
  async.retry({times: 6, interval: 100}, (_cb) => {
      new mssql.Request().query(
        `select top 30 * from report..QMXStockPool where ID > ${nextId} and InstituteFullName is not null and PriceRC is not null and PriceRC != 0`,
        (err, records) => {
          if (!records) return _cb('no report find');
          _cb(err, records.recordset);
        }
      );
  }, cb);
}

function getReportsThenProcess(nextId, analystMap, cb) {
  let localNextId = nextId;
  let localReports;
  async.during(
    (_cb) => {
      getReportsByNextId(localNextId, (err, reports) => {
        console.log('get nextId:', localNextId);
        if (err) return _cb(err);
        if (_.isEmpty(reports)) {
          logger.info('reports is empty, scan finished', localNextId);
          return _cb(null, false);
        }
        localReports = reports;
        console.log(localNextId, localReports.length);
        _cb(null, true);
      });
    },
    (_cb) => {
      processReports(localReports, analystMap, (err, retNextId) => {
        if (err) return _cb(err);
        localNextId = retNextId;
        _cb();
      });
    },
    cb
  );
}

function processReports(reports, analystMap, cb) {
  let nextId = reports[reports.length - 1].ID;

  async.series({
    process: (_cb) => {
      async.eachLimit(reports, 10, processOneReportFunc(analystMap), _cb);
    },
    saveNextId: (_cb) => {
      redisService.setAnalystReportNextId(nextId, _cb);
    },
  }, (err) => {
    cb(err, nextId);
  });
}

function processOneReportFunc(analystMap) {
  return function(report, cb) {
    if (report.TargetPriceL) {
      if (report.TargetPriceL < report.PriceRC) {
        loggerD.write('tooSmallTargetPriceL',
          report.ID, report.TargetPriceL, report.PriceRC
        );
        return cb();//如果目标低价过低，则丢弃
      }
    } else {
      if (!(report.GradeC && ratio[report.GradeC])) {
        return cb();
      }

      report.TargetPriceL = ratio[report.GradeC] * report.PriceRC;
      report.TargetPriceH = report.TargetPriceL;
    }
    let names = _.compact(report.AuthorName.split(','));
    async.each(names, processOneAnalystNameFunc(report, analystMap), cb);
  };
}

function processOneAnalystNameFunc(report, analystMap) {
  return function(name, cb) {
    let nameChanged = isOrgNameChanged[report.InstituteFullName];
    if(nameChanged) {
      logger.info('org name changed', {nameChanged});
      report.InstituteFullName = nameChanged;
    }
    let analyst = analystMap[`${report.InstituteFullName}:${name}`];
    if (!analyst) {
      loggerD.write('noAnalystForThisReport',
        report.ID, report.InstituteFullName, name
      );
      return cb();//如果没有相关分析师，此条研报丢弃
    }//166340

    async.series({
      createReport: (_cb) => {
        Report.update({
          analystId: analyst._id, qmxReportId: report.ID
        }, buildReportData(report), {upsert: true}, _cb);
      },
      updateAnalyst: (_cb) => {
        analyst.instituteShort = report.InstituteNameCN;
        if (report.IsAuthorStar) {//获奖研报处理stars字段
          let stars = _.compact(report.IsAuthorStar.split(','));
          analyst.stars.addToSet.apply(analyst.stars, stars);
        }
        Analyst.update({_id: analyst._id}, analyst, _cb);
      },
    }, cb);
  };
}
