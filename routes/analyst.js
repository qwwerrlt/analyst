'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/analyst');

router.get('/', controller.index);//?keyword=xxx或?page=x[&monthsAgo=y]
router.get('/:_id', controller.show);
router.get('/:_id/stocks', controller.stocks);

module.exports = router;
