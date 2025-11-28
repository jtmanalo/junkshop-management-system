const transactionService = require('./services');

// Get all transactions
async function getAll(req, res) {
    try {
        const transactions = await transactionService.getAll();
        if (transactions.length === 0) {
            return res.status(204).send("No transactions found");
        }
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createLoan(req, res) {
    try {
        const newLoan = await transactionService.createLoan(req.body);
        res.status(201).json(newLoan);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createRepayment(req, res) {
    try {
        const newRepayment = await transactionService.createRepayment(req.body);
        res.status(201).json(newRepayment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createExpense(req, res) {
    try {
        const newExpense = await transactionService.createExpense(req.body);
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getExpenseBalance(req, res) {
    const { branchId, userId } = req.query;
    try {
        const balance = await transactionService.getExpenseBalance(branchId, userId);
        res.status(200).json(balance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getSaleBalance(req, res) {
    const { branchId, userId } = req.query;
    try {
        const balance = await transactionService.getSaleBalance(branchId, userId);
        res.status(200).json(balance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getPurchaseBalance(req, res) {
    const { branchId, userId } = req.query;
    try {
        const balance = await transactionService.getPurchaseBalance(branchId, userId);
        res.status(200).json(balance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Create a transaction
async function create(req, res) {
    const {
        buyerId,
        sellerId,
        employeeId,
        partyType,
        transactionType,
        totalAmount,
        paymentMethod,
        status,
        notes
    } = req.body;

    if (!transactionType) {
        return res.status(400).json({ error: 'TransactionType is required.' });
    }

    try {
        const newTransaction = await transactionService.create({
            buyerId,
            sellerId,
            employeeId,
            partyType,
            transactionType,
            totalAmount,
            paymentMethod,
            status,
            notes
        });
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error('Error in createTransaction:', error);
        res.status(500).json({ error: error.message });
    }
}

async function update(req, res) {
    const transactionId = parseInt(req.params.id, 10);

    try {
        const updatedTransaction = await transactionService.update(transactionId, req.body);
        res.status(200).json(updatedTransaction);
    } catch (error) {
        console.error('Error in updateTransaction:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    update,
    createExpense,
    getExpenseBalance,
    getSaleBalance,
    getPurchaseBalance,
    createLoan,
    createRepayment
};
