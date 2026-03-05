const express = require('express');
const { createBuilding, getBuildings, updateBuilding, deleteBuilding } = require('../controllers/buildingController');

const router = express.Router();

router.post('/', createBuilding);
router.get('/', getBuildings);
router.put('/:id', updateBuilding);
router.delete('/:id', deleteBuilding);

module.exports = router;
