'use strict'

const request = require('request');
const _ = require('lodash');
const moment = require('moment');
const _u = require('./common/util');
const async = require('async');
const infoIds = require('./infoIds.json');
const Analyst = _u.model('Analyst');
const redisService = _u.service('redis');
const PTI_ARR = {PTI1PERSON: 1, PTI4PERSON: 4};
const ORG_URL = 'http://person.sac.net.cn/pages/registration/train-line-register!orderSearch.action';
const PERSON_URL = 'http://person.sac.net.cn/pages/registration/train-line-register!search.action';
const DETAIL_URL = 'http://person.sac.net.cn/pages/registration/train-line-register!search.action';

function crawl(cb){
  _u.mySeries({
    orgArr: (_cb) => {
      orgCrawl(_cb);
    },
    pppArr: (_cb, res) => {
      personPppArr(res.orgArr, _cb);
    },
    rpiArr: (_cb) => {
      personRpiArr(_cb);
    },
    update: (_cb) => {
      updatePersonInfo(_cb);
    },
  }, cb);
}

function httpGetData(conditions, cb){
  let count = 0;
  async.retry({times: 6, interval: 5000}, (_cb) => {
    if(count > 0) console.log('retry post', {count})
    request.post(conditions, (err, res, body) => {
      count++;
      if(err) return _cb(err);
      let data = null;
      try {
        data = JSON.parse(body);
      } catch (e) {
        return _cb(e);
      }
      _cb(null, data);
    });
  }, cb);
}

//证券公司列表
function orgCrawl(cb){
  let formData = {
    filter_EQS_OTC_ID: '10',
    ORDERNAME: 'AOI#AOI_NAME',
    ORDER: 'ASC',
    sqlkey: 'registration',
    sqlval: 'SELECT_LINE_PERSON'
  };
  httpGetData({url: ORG_URL, formData}, (err, items) => {
    if(err) return cb(err);
    let personArr = [];
    let total = 0;
    _.each(items, (item) => {
      let aoiName = item['AOI_NAME'];
      let aoiId = item['AOI_ID'];
      let num = +item['PTI4PERSON'];
      total += num;
      personArr.push({
        aoiId: aoiId,
        aoiName: aoiName,
        ptiId: 4
      });
    });
    console.log('total analyst: ', {total});
    cb(null, personArr);
  })
}//2134

function personPppArr(orgs, cb){
  _u.mySeries({
    num: (_cb) => {
      redisService.getAnalystNum(_cb);
    },
    ppps: (_cb, ret) => {
      if (ret.num > 0) return _cb();
      async.eachSeries(orgs, personCrawl, _cb);
    },
  }, cb);
}

//个人列表
function personCrawl(org, cb){
  console.log('getorg',{org});
  let formData = {
    filter_LES_ROWNUM: 200,
    filter_GTS_RNUM: 0,
    filter_EQS_PTI_ID: org.ptiId,
    filter_EQS_AOI_ID: org.aoiId,
    sqlkey: 'registration',
    sqlval: 'SEARCH_FINISH_PUBLICITY'
  };
  httpGetData({url: PERSON_URL, formData}, (err, items) => {
    if (err) return cb(err);
    let pppIdArr = _.map(items, 'PPP_ID');
    if (_.isEmpty(pppIdArr)) return cb();
    redisService.setAnalystIds('pppIds', pppIdArr, cb);
  });
}

function personRpiArr(cb){
  let isEmpty = false;
  async.doWhilst(
    (_cb) => {
      _u.mySeries({
        pppId: (__cb) => {
          redisService.popAnalystIds('pppIds', 1, __cb);
        },
        rpiId: (__cb, ret) => {
          if (!ret.pppId[0]) {
            isEmpty = true;
            console.log('getRpiId ...... end');
            return __cb();
          }
          getRpiId(ret.pppId[0], __cb);
        },
      }, _cb);
    },
    () => { return !isEmpty; },
    cb
  );
}

//获取rpiID
function getRpiId(pppID,cb){
  console.log('getpppID',{pppID});
  let formData = {
    filter_EQS_PPP_ID : pppID,
    sqlkey: 'registration',
    sqlval: 'SD_A02Leiirkmuexe_b9ID'
  };
  httpGetData({url: PERSON_URL, formData}, (err, items)=> {
    if (err) {
      redisService.setAnalystIds('pppIds', pppID, (error) => {
        if(error) return cb(error);
      });
      return cb(err);
    }
    if(!items[0]){
      return cb(new AppErr('notFound',null,{items}));
    }
    let rpiId = items[0]['RPI_ID'];
    if (!rpiId) return cb();
    redisService.setAnalystIds('rpiIds', rpiId, cb);
  });
}

function updatePersonInfo(cb){
  let isEmpty = false;
  async.doWhilst(
    (_cb) => {
      _u.mySeries({
        rpiId: (__cb) => {
          redisService.popAnalystIds('rpiIds', 1, __cb);
        },
        info: (__cb, ret) => {
          if (!ret.rpiId[0]) {
            isEmpty = true;
            console.log('crawl successfully');
            return __cb();
          }
          personInfo(ret.rpiId[0], __cb);
        },
        update: (__cb, ret) => {
          if (isEmpty) return __cb();
          let info = ret.info;
          updateAnalyst(info, __cb);
        },
      }, _cb);
    },
    () => { return !isEmpty; },
    cb
  );
}

function personInfo(rpiId, cb){
  console.log('getRpiID',{rpiId});
  async.parallel({
    info : (_cb) => {
      infoCrawl(rpiId, _cb);
    },
    changList : (_cb) => {
      changeListCrawl(rpiId, _cb);
    },
  }, (err, ret) => {
    if (err) {
      redisService.setAnalystIds('rpiIds', rpiId, (error) => {
        if(error) return cb(error);
      });
      return cb(err);
    }
    let info = null;
    if (ret.info && ret.changList) {
      info = _.assign(ret.info, ret.changList);
    }
    setTimeout(function() {
      cb(null, info);
    }, 1);
  });
}

//个人详细信息
function infoCrawl(rpiId, cb){
  let formData = {
    filter_EQS_RPI_ID: rpiId,
    sqlkey: 'registration',
    sqlval:'SELECT_PERSON_INFO'
  };
  let conditions = {url: DETAIL_URL, formData, headers: {Connection: 'close'}};
  httpGetData(conditions, (err, items) => {
    if (err) return cb(err);
    let size = items.length;
    let item = items[0];
    let info = {
      name: item.RPI_NAME,
      photo: 'http://photo.sac.net.cn/sacmp/images/' + item.RPI_PHOTO_PATH,
      sex: item.SCO_NAME,
      education: item.ECO_NAME,
      certificateNum: item.CER_NUM,
      institute: item.AOI_NAME,
      positionName: item.PTI_NAME,
      cfBeginDate: item.OBTAIN_DATE,
      cfEndDate: item.ARRIVE_DATE,
      rpiId: rpiId
    };
    cb(null, info);
  });
}

//证书变更信息
function changeListCrawl(rpiId, cb) {
  let formData = {
    'filter_EQS_RH#RPI_ID': rpiId,
    sqlkey: 'registration',
    sqlval: 'SEARCH_LIST_BY_PERSON'
  };
  let conditions = {url: DETAIL_URL, formData, headers: {Connection: 'close'}}
  httpGetData(conditions, (err, items) => {
    if (err)  return cb(err);
    let size = items.length;
    let item = items[size - 1];
    let history = [];
    for (let i = 0; i < size; i++){
      if (items[i].PTI_NAME == '证券投资咨询业务(分析师)'){
        history.push({
          certificateNum: items[i].CER_NUM,
          institute: items[i].AOI_NAME,
          positionName: items[i].PTI_NAME,
          startTime: moment(items[i].OBTAIN_DATE).toDate(),
          endTime: i == size-1 ? moment().toDate() : moment(items[i+1].OBTAIN_DATE).toDate(),
        });
      }
    }
    let cf = {
      cfStatus: item.CERTC_NAME,
      numOfchange: size,
      history,
    };
    cb(null, cf);
  });
}

function updateAnalyst(info, cb) {
  let certificateNum = info.certificateNum;
  _u.mySeries({
    check: (_cb) => {
      Analyst.findOne({certificateNum}, _cb);
    },
    update: (_cb, ret) => {
      let conditions = null;
      let institutes = null;
      if (ret.check) {
        conditions = {certificateNum};
      } else {
        institutes = _.map(info.history, 'institute');
        conditions = {
          name: info.name,
          institute: {$in: institutes},
        }
      }
      Analyst.update(conditions, info, {upsert: true}, _cb);
    },
  }, cb);
}

crawl((err, infos)=>{
  if (err){
    console.log('研究员抓取异常', err);
    process.exit(1);
  }
  process.exit(0);
});
