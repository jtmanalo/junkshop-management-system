const buyerService = require('./services');

// Get all buyers
async function getAll(req, res) {
    try {
        const buyers = await buyerService.getAll();
        if (buyers.length === 0) {
            return res.status(204).send("No buyers found");
        }
        res.json(buyers);
    } catch (error) {
        console.error('Error getAllBuyers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAllWithPrices(req, res) {
    try {
        const buyers = await buyerService.getAllWithPrices();
        if (buyers.length === 0) {
            return res.status(204).send("No buyers found");
        }
        res.json(buyers);
    } catch (error) {
        console.error('Error getAllWithPrices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAllWithPricesFormatted(req, res) {
    try {
        const buyers = await buyerService.getAllWithPrices();
        if (buyers.length === 0) {
            return res.status(204).send("No buyers found");
        }

        // Transform PascalCase to camelCase for frontend table
        const formattedRows = buyers.map(buyer => ({
            buyerId: buyer.BuyerID,
            itemName: buyer.Name && buyer.Classification && buyer.UnitOfMeasurement
                ? `${buyer.Name} - ${buyer.Classification} (${buyer.UnitOfMeasurement})`
                : buyer.Name
                    ? `${buyer.Name} (${buyer.UnitOfMeasurement})`
                    : '',
            price: buyer.Price,
            companyName: buyer.CompanyName
        }));

        res.json(formattedRows);
    } catch (error) {
        console.error('Error getAllWithPricesFormatted:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getList(req, res) {
    try {
        const buyers = await buyerService.getBuyersList();
        if (buyers.length === 0) {
            return res.status(204).send("No buyers found");
        }
        res.json(buyers);
    } catch (error) {
        console.error('Error getBuyersList:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create a buyer
async function create(req, res) {
    const {
        companyName,
        contactPerson,
        notes,
        contactMethod,
        contactDetail
    } = req.body;

    try {
        const newBuyer = await buyerService.create({
            companyName,
            contactPerson,
            notes,
            contactMethod,
            contactDetail
        });
        res.status(201).json(newBuyer);
    } catch (error) {
        console.error('Error createBuyer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get buyer by ID
async function getById(req, res) {
    try {
        const buyer = await buyerService.getById(parseInt(req.params.id, 10));
        if (!buyer) {
            return res.status(404).send("Buyer not found");
        }
        res.json(buyer);
    } catch (error) {
        console.error('Error getBuyerById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update a buyer
async function update(req, res) {
    const buyerId = parseInt(req.params.id, 10);
    const { companyName, contactPerson, notes, status } = req.body;

    try {
        const updatedBuyer = await buyerService.update(buyerId, {
            companyName,
            contactPerson,
            notes,
            status
        });
        if (!updatedBuyer) {
            return res.status(404).send("Buyer not found");
        }
        res.json(updatedBuyer);
    } catch (error) {
        console.error('Error updateBuyer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update,
    getList,
    getAllWithPrices,
    getAllWithPricesFormatted
};