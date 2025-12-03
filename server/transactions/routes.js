const express = require('express');
const transactionController = require('./controllers');
const router = express.Router();

// Get all transactions
router.get('/transactions', transactionController.getAll);

// Create a transaction
router.post('/transactions', transactionController.create);

// Create an expense
router.post('/expenses', transactionController.createExpense);

// Create a loan
router.post('/loans', transactionController.createLoan);

// Create a repayment
router.post('/repayments', transactionController.createRepayment);

router.post('/purchases', transactionController.createPurchase);
router.post('/sales', transactionController.createSale);

router.get('/daily-logs/:shiftId', transactionController.getDailyLogs);

router.get('/pending-transactions/:shiftId', transactionController.getPendingTransactionsByShift);
router.get('/transaction-items/:transactionId', transactionController.getTransactionItems);

// Get seller loans
router.get('/seller-loans', transactionController.getSellerLoans);
router.get('/employee-loans', transactionController.getEmployeeLoans); // reuse same controller

router.get('/expense-balance', transactionController.getExpenseBalance);
router.get('/sale-balance', transactionController.getSaleBalance);
router.get('/purchase-balance', transactionController.getPurchaseBalance);

// Update a transaction
router.put('/purchases/:transactionId', transactionController.update);

// Delete a transaction
// router.delete('/transactions/:id', transactionController.remove);

module.exports = router;