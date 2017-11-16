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
  rid: {
    $type: String,
    unique: true,
    required: true,
  },
  rtype: String,//topInfo stock theme
  topicName: String,
  keyword: {},
  nextId: String,
  disabled: Boolean,
}, {collection: 'effect_topic', timestamps: true, typeKey: '$type'});

schema.index({createdAt: 1});
schema.index({updatedAt: 1});

module.exports = db.analyst.model('EffectTopic', schema);
