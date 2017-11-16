'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const db = require('../common/connectMongo');

let schema = new Schema({
  host: {
    $type: String,
    unique: true,
  },
  name: String,
  dailyPV: Number,
  weight: Number,
}, {collection: 'host_weight', typeKey: '$type'});

module.exports = db.analyst.model('HostWeight', schema);
