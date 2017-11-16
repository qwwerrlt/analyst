'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const db = require('../common/connectMongo');

let schema = new Schema({
  hylandaId: {
    $type: String,
    unique: true,
    required: true,
  },
  scode: String,
  sname: String,
  topicName: String,
  nextId: String,
}, {collection: 'negative_topic', timestamps: true, typeKey: '$type'});

module.exports = db.analyst.model('NegativeTopic', schema);
