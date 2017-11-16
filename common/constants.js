'use strict';

module.exports = {
  zeroEffect: 0.000084528771,
  dptBase: 200000000,//2亿
  sourceType: {
    INFO:   '0' ,//资讯
    BBS:    '1' ,//
    TIEBA:  '2' ,//贴吧
    BLOG:   '3' ,//博客
    WEIBO:  '4' ,//微博
    WECHAT: '11',//微信
  },
  sourceTypeName: {
    '0' : '资讯',
    '1' : 'BBS' ,
    '2' : '股吧',
    '3' : '博客',
    '4' : '微博',
    '11': '微信',
  },
  IllegalTheme: {
    'B$998001': '流通A股',
    'B$998000': '流通市值',
    'B$993806': '创业板',
    'B$993084': '封闭基金',
    'B$998003': '平均股价',
    'B$998002': '总市值',
    'B$993245': '大智慧88',
    'B$993406': '泽熙持股',
  },
  favorStockAlarmPolicies: [
    'UP_7PERCENT',
    'DOWN_7PERCENT',
    'UP_STAYING',
    'DOWN_STAYING',
    'LIMIT_UP_OPEN',
    'LIMIT_DOWN_OPEN',
    'VOLUME_SPIKE',
  ],
  forceNodes: [
    {label: "强制词1",  nodeId: "80",  mrwId: "546951"},
    {label: "强制词2",  nodeId: "98",  mrwId: "546938"},
    {label: "强制词3",  nodeId: "92",  mrwId: "546943"},
    {label: "强制词4",  nodeId: "86",  mrwId: "546948"},
    {label: "强制词5",  nodeId: "74",  mrwId: "546954"},
    {label: "强制词6",  nodeId: "68",  mrwId: "546960"},
    {label: "强制词7",  nodeId: "62",  mrwId: "546964"},
    {label: "强制词8",  nodeId: "104", mrwId: "546932"},
    {label: "强制词9",  nodeId: "470", mrwId: "546935"},
    {label: "强制词10", nodeId: "465", mrwId: "547051"},
  ],
  similarNode: {label: "近义词", nodeId: "17", mrwId: "547167"},
  antonymNode: {label: "排除词", nodeId: "11", mrwId: "547617"},
};
