'use strict';

const express = require('express');
const router = express.Router();

const controller = require('../controllers/report');

router.get('/:qmxReportId', controller.qmxReport);

module.exports = router;
