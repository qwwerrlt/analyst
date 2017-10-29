'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/hotStock');

router.get('/', controller.index);//?page=x
router.get('/:sCode', controller.show);//不包括前缀和后缀的部分，6位数字
router.get('/:_id/reports', controller.showReports);
router.get('/:sCode/reports/v2', controller.showReportsV2);//?[monthsAgo=x]

module.exports = router;
