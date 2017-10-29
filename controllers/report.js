'use strict';

const mssql = require('mssql');
const _ = require('lodash');
const _u = require('../common/util');

exports.qmxReport = (req, res, next) => {
  let qmxReportId = req.params.qmxReportId;
  _u.mySeries({
    connect: (_cb) => {
      require('../common/mssql')(_cb);
    },
    report: (_cb) => {
      getOneReport(qmxReportId, _cb);
    },
  }, (err, ret) => {
    if (err) return next(err);
    res.status(200).send(JSON.stringify(ret.report));
  });
};

function getOneReport(qmxReportId, cb) {
  new mssql.Request().query(
    `select * from report..QMXStockPool where ID = ${qmxReportId}`,
    (err, records) => {
      if (err) return cb(err);
      cb(null, records.recordset[0]);
      mssql.close();
    }
  );
}
