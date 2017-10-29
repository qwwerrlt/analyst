//各种统计计算以5年为限，研报有效期为6个月
var numOfYears = 5;
var someYearsAgo = new Date();
someYearsAgo.setFullYear(someYearsAgo.getFullYear() - numOfYears);
print(someYearsAgo)

//最新研报的时间
db.report.aggregate([{
  $match: {
    fRatio: {$ne: null},
    reportDate: {$gte: someYearsAgo},
  },
}, {
  $sort: {
    reportDate: -1
  },
}, {
  $group: {
    _id: '$analystId',
    latestReport: {
      $first: {
        sName: '$sName',
        sCode: '$sCode',
        maxRate: '$maxRate',
        reportDate: '$reportDate',
        fPriceRC: '$fPriceRC',
        fTargetPriceL: '$fTargetPriceL',
        fTargetPriceH: '$fTargetPriceH',
      }
    },
  }
}]).forEach(function(doc) {
  db.analyst.update({_id: doc._id}, {$set: {
    latestReport: doc.latestReport,
    updatedAt: new Date(),
  }});
});

//推荐最成功的股票
db.report.aggregate([{
  $match: {
    fRatio: {$ne: null},
    reportDate: {$gte: someYearsAgo},
  },
}, {
  $sort: {
    maxRate: -1
  },
}, {
  $group: {
    _id: '$analystId',
    maxRateStock: {
      $first: {
        sName: '$sName',
        sCode: '$sCode',
        maxRate: '$maxRate',
        reportDate: '$reportDate',
        fPriceRC: '$fPriceRC',
      }
    },
  }
}]).forEach(function(doc) {
  db.analyst.update({_id: doc._id}, {$set: {
    maxRateStock: doc.maxRateStock,
    updatedAt: new Date(),
  }});
});

//清除最大跌幅的股票记录
db.analyst.update({}, {$unset: {minRateStock: ''}}, {multi: true});

//推荐最失败的股票
db.report.aggregate([{
  $match: {
    fRatio: {$ne: null},
    reportDate: {$gte: someYearsAgo},
    winFlag: {$ne: true},//过滤掉推荐成功的股票
  },
}, {
  $sort: {
    minRate: 1
  },
}, {
  $group: {
    _id: '$analystId',
    minRateStock: {
      $first: {
        sName: '$sName',
        sCode: '$sCode',
        minRate: '$minRate',
        reportDate: '$reportDate',
        fPriceRC: '$fPriceRC',
      }
    },
  }
}]).forEach(function(doc) {
  db.analyst.update({_id: doc._id}, {$set: {
    minRateStock: doc.minRateStock,
    updatedAt: new Date(),
  }});
});

//计算分析师的胜率
db.report.aggregate([{
  $match: {
    fRatio: {$ne: null},
    reportDate: {$gte: someYearsAgo},
  }
}, {
  $group: {
    _id: '$analystId',
    total: {$sum: 1},
    win: {$sum: {$cond: [{$eq: ['$winFlag', true]}, 1, 0]}},
  },
}]).forEach(function(doc) {
  print('compute winRate for analyst:', doc._id);
  db.analyst.update({_id: doc._id}, {$set: {
    winRate: (doc.win / doc.total) * 100,
    total: doc.total, win: doc.win, lose: doc.total - doc.win,
  }});
});

//删除所有名次
db.analyst.update({}, {$unset: {rank: ''}}, {multi: true});

//根据胜率，生成排名
var rank = 1;
db.analyst.find({
  winRate: {$gt: 0},
  total: {$gte: 10},
}).sort({winRate: -1, total: -1, 'maxRateStock.maxRate': -1}).forEach(function(doc) {
  print('analyst rank:', doc._id, rank);
  db.analyst.update({_id: doc._id}, {$set: {rank: rank++}});
});

//针对有winRate字段的分析师，计算平均胜率
var avgWinRate;
db.analyst.aggregate([{
  $match: {winRate: {$gte: 0}}
}, {
  $group: {
    _id: null,
    avgWinRate: {$avg: '$winRate'},
  }
}]).forEach(function(doc) {
  avgWinRate = doc.avgWinRate;
  print('avgWinRate:', avgWinRate);
});

print('start to build hot_stock...');
//统计股票对应的研报信息，输出最热股票，计算股票强力指数，并排名
var sixMonthsAgo = new Date();
var month = sixMonthsAgo.getMonth();
if (month - 6 < 0) {
  sixMonthsAgo.setFullYear(sixMonthsAgo.getFullYear() - 1);
  sixMonthsAgo.setMonth(month - 6 + 12);
} else {
  sixMonthsAgo.setMonth(month - 6);
}
db.report.aggregate([{
  $match: {
    fRatio: {$ne: null},
    reportDate: {$gte: sixMonthsAgo},
  }
}, {
  $sort: {reportDate: -1}
}, {
  $group: {
    _id: '$sCode',
    sName: {$first: '$sName'},
    minFTargetPriceL: {$min: '$fTargetPriceL'},
    maxFTargetPriceH: {$max: '$fTargetPriceH'},
    analystIds: {$push: '$analystId'},
    reportIds: {$push: '$_id'},
    count: {$sum: 1},
  }
}, {
  $project: {
    _id: false,
    sCode: '$_id',
    sName: true,
    minFTargetPriceL: true,
    maxFTargetPriceH: true,
    analystIds: true,
    reportIds: true,
    count: true,
    createdAt: {$literal: new Date()},
    updatedAt: {$literal: new Date()},
  },
}, {
  $out: 'hot_stock'
}]);
print('hot_stock build completed');

//构建分析师map，便于后面快速查找相关信息
var analystMap = {};
db.analyst.find({winRate: {$gte: 0}}, {
  winRate: 1, name: 1, photo: 1, photo2: 1,
}).forEach(function(doc) {
  analystMap[doc._id] = doc;
});

//计算强力指数
function getForceIndex(analystIds) {
  var sum = 0;
  var length = analystIds.length;
  for (var i = 0; i < length; i++) {
    sum += analystMap[analystIds[i]].winRate || 0;
  }
  return (sum + avgWinRate) / (length + 1);
}

db.hot_stock.find().snapshot().forEach(function(doc) {
  print('compute force index for hot_stock:', doc._id);
  db.hot_stock.update({_id: doc._id}, {$set: {
    forceIndex: getForceIndex(doc.analystIds),
  }});
});

//根据强力指数，为rank赋值
var rank = 1;
db.hot_stock.find().sort({forceIndex: -1}).forEach(function(doc) {
  print('hot_stock rank:', doc._id, rank);
  db.hot_stock.update({_id: doc._id}, {$set: {rank: rank++}});
});

//根据推荐人数，为countRank赋值
var countRank = 1;
db.hot_stock.find().sort({count: -1}).forEach(function(doc) {
  print('hot_stock countRank:', doc._id, countRank);
  db.hot_stock.update({_id: doc._id}, {$set: {countRank: countRank++}});
});

//五年内推荐篇数 /* {sCode: [report]} */
print('start to build someYearsReports, this will take several seconds...');
var someYearsReports = {};
db.report.aggregate([{
  $match: {
    fRatio: {$ne: null},
    reportDate: {$gte: someYearsAgo},
  }
}, {
  $sort: {reportDate: -1}
}, {
  $group: {
    _id: '$qmxReportId',
    analystIds: {$push: '$analystId'},
    sCode: {$first: '$sCode'},
    sName: {$first: '$sName'},
    fTargetPriceL: {$first: '$fTargetPriceL'},
    fTargetPriceH: {$first: '$fTargetPriceH'},
    reportDate: {$first: '$reportDate'},
    reportEndDate: {$first: '$reportEndDate'},
  }
}]).forEach(function(doc) {
  if (!someYearsReports[doc.sCode]) someYearsReports[doc.sCode] = [];

  var names = doc.analystIds.map(function(analystId) {
    return analystMap[analystId].name;
  });
  doc.qmxReportId = doc._id;
  delete doc._id;
  doc.names = names;
  //取第一个分析师的头像和胜率
  doc.photo2   = analystMap[doc.analystIds[0]].photo2;
  doc.winRate = analystMap[doc.analystIds[0]].winRate;
  someYearsReports[doc.sCode].push(doc);
});
print('someYearsReports build completed');

db.hot_stock.find().snapshot().forEach(function(doc) {
  print('reports length:', doc.sCode, someYearsReports[doc.sCode].length);
  db.hot_stock.update({sCode: doc.sCode}, {$set: {
    someYearsReports: someYearsReports[doc.sCode].sort(function(a, b) {
      return b.reportDate.getTime() - a.reportDate.getTime();
    }),
  }});
});

//聚合热股的研报信息，根据研究员来分组
db.report.aggregate([{
  $match: {
    fRatio: {$ne: null},
    reportDate: {$gte: someYearsAgo},
  }
}, {
  $sort: {reportDate: -1}
}, {
  $group: {
    _id: {
      analystId: '$analystId',
      sCode: '$sCode',
    },
    reports: {
      $push: {
        qmxReportId: '$qmxReportId',
        fTargetPriceL: '$fTargetPriceL',
        fTargetPriceH: '$fTargetPriceH',
        reportDate: '$reportDate',
      },
    },
  }
}, {
  $project: {
    _id: 0,
    analystId: '$_id.analystId',
    sCode: '$_id.sCode',
    reports: true,
  },
}, {
  $out: 'stock_report'
}]);

//为这些热股研报信息附加研究员的相关数据
db.analyst.find({}, {winRate: 1, name: 1, photo2: 1}).forEach(function(doc) {
  print('update stock_report for analystId:', doc._id);
  db.stock_report.update({
    analystId: doc._id
  }, {
    $set: {
      name:    doc.name,
      winRate: doc.winRate,
      photo2:  doc.photo2,
    }
  }, {multi: true});
});

//导出6个月的数据
db.stock_report.aggregate([{
  $redact: {$cond: {
    if: {
      $or: [{
        $not: '$reportDate'
      }, {
        $gte: [
          '$reportDate',
          sixMonthsAgo
        ]
      }]
    },
    then: '$$DESCEND',
    else: '$$PRUNE'
  }}
}, {
  $redact: {$cond: {
    if: {
      $eq: [{$size: '$reports'}, 0]
    },
    then: '$$PRUNE',
    else: '$$KEEP'
  }}
}, {
  $out: 'stock_report6',
}]);
