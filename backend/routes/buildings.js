const express = require('express');
const { createBuilding, getBuildings, updateBuilding, deleteBuilding, clearBuildingData } = require('../controllers/buildingController');

const router = express.Router();

router.post('/', createBuilding);
router.get('/', getBuildings);
router.put('/:id', updateBuilding);
router.delete('/:id', deleteBuilding);
router.delete('/:id/clear-data', clearBuildingData);

module.exports = router;
