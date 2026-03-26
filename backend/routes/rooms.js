const express = require('express');
const { getRooms, createRoom } = require('../controllers/roomController');

const router = express.Router();

router.get('/', getRooms);
router.post('/', createRoom);

module.exports = router;
