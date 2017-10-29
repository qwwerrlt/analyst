'use strict';

const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('config');
const morgan = require('morgan');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const FileStreamRotator = require('file-stream-rotator');
const order = require('./routes/order');
const _u = require('./common/util');
const logger = _u.logger;
const AppErr = require('./common/AppErr');
const app = express();

const accessLog = FileStreamRotator.getStream(config.logging.accessLog);
const errorLog = fs.createWriteStream(config.logging.errorLog, {flags: 'a'});

morgan.format('gpws', config.logging.format);
app.use(morgan('gpws', {stream: accessLog}));
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

if (_u.isProduction) app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.use((req, res, next) => {
  let agent = req.headers['x-sg-agent'];
  let headers = req.headers;
  logger.info({url: req.originalUrl, query: req.query, body: req.body, agent, headers});

  if (agent) {
    let splits = agent.split('/');
    req.clientType = splits[0].toLowerCase();
    req.clientVersion = splits[1];
  }

  let perPage = +req.query.perPage || config.pageInfo.perPage;
  let page = +req.query.page || 1;
  req.pageInfo = {perPage, page};
  req.pageForMongo = {
    skip: (page - 1) * perPage,
    limit: perPage,
  };

  res.page = (totalNum, payload) => {
    let pageInfo = {page, perPage, totalNum};
    res.json({message: 'ok', pageInfo, timestamp: Date.now(), payload});
  };
  next();
});

app.use('/analysts'               , require('./routes/analyst'));
app.use('/reports'                , require('./routes/report'));
app.use('/hotStocks'              , require('./routes/hotStock'));
app.get('/order/submit/ali'       , order.submitOrder);
app.post('/order/submit/ali'      , order.submitOrder);
app.get('/order/query/ali'        , order.queryOrder);
app.post('/notify/ali'            , order.aliNotify);
app.get('/user/info/query'        , order.queryUserInfo);

const util = require('util');
app.use((err, req, res, next) => {
  let meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  logger.error(err, JSON.stringify(err.more));
  if (!err.status) {
    err = new AppErr('systemError', 500, {err: util.inspect(err)});
  }
  res.status(err.status).json(err);
});

app.listen(config.port);
