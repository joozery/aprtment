const express = require('express');
const { getTenants, createTenant, deleteTenant, updateTenant, bulkImportTenants } = require('../controllers/tenantController');

const router = express.Router();

router.get('/', getTenants);
router.post('/', createTenant);
router.post('/bulk-import', bulkImportTenants);
router.delete('/:id', deleteTenant);
router.put('/:id', updateTenant);

module.exports = router;
