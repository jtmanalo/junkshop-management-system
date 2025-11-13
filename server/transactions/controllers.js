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

async function getById(req, res) {
    try {
        const transaction = await transactionService.getById(parseInt(req.params.id, 10));
        if (!transaction) {
            return res.status(404).send("Transaction not found");
        }
        res.status(200).json(transaction);
    } catch (error) {
        console.error('Error in getTransactionById:', error);
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
    getById,
    update
};
