const sellerService = require('./services');

// Get all sellers
async function getAll(req, res) {
    try {
        const employees = await sellerService.getAll();
        if (employees.length === 0) {
            return res.status(204).send("No seller found");
        }
        res.json(employees);
    } catch (error) {
        console.error('Error in getAllSellers:', error);
        res.status(500).json({ error: error.message });
    }
}

// Create a seller
async function create(req, res) {
    const {
        name,
        contactNumber
    } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required.' });
    }

    try {
        const seller = await sellerService.create({
            name,
            contactNumber
        });
        res.status(201).json(seller);
    } catch (error) {
        console.error('Error in createSeller:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get seller by ID
async function getById(req, res) {
    try {
        const seller = await sellerService.getById(parseInt(req.params.id));
        if (!seller) {
            return res.status(404).send("Seller not found");
        }
        res.json(seller);
    } catch (error) {
        console.error('Error in getSellerById:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a seller
async function update(req, res) {
    const sellerId = parseInt(req.params.id, 10);

    try {
        const updatedSeller = await sellerService.update(sellerId, req.body);
        res.json(updatedSeller);
    } catch (error) {
        console.error('Error in updateSeller:', error);
        res.status(500).json({ error: error.message });
    }
}

// Delete a seller
async function remove(req, res) {
    try {
        const sellerId = parseInt(req.params.id);
        const result = await sellerService.remove(sellerId);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        res.status(200).json({ message: 'Seller deleted successfully' });
    } catch (error) {
        console.error('Error in deleteSeller:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAll,
    create,
    getById,
    update,
    remove,
};