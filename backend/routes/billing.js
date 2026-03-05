const express = require('express');
const router = express.Router();
const {
    getInvoices,
    createInvoice,
    payInvoice,
    updateInvoice,
    deleteInvoice
} = require('../controllers/invoiceController');

router.get('/', getInvoices);
router.post('/', createInvoice);
router.put('/:room/pay', payInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

module.exports = router;
