const express = require('express');
const router = express.Router();

const join = require('./canvas/join')
router.use('/join', join)

const create = require('./canvas/create')
router.use('/create', create)

module.exports = router;