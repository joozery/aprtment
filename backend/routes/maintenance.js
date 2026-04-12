const express = require('express');
const {
    getMaintenance,
    addMaintenance,
    updateMaintenanceStatus,
    deleteMaintenance
} = require('../controllers/maintenanceController');

const router = express.Router();

router.get('/', getMaintenance);
router.post('/', addMaintenance);
router.put('/:id', updateMaintenanceStatus);
router.delete('/:id', deleteMaintenance);

module.exports = router;
