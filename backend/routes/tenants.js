const express = require('express');
const { getTenants, createTenant, deleteTenant, updateTenant } = require('../controllers/tenantController');

const router = express.Router();

router.get('/', getTenants);
router.post('/', createTenant);
router.delete('/:id', deleteTenant);
router.put('/:id', updateTenant);

module.exports = router;
