const buyerContactService = require('./services');

async function create(req, res) {
    try {
        const { buyerId } = req.params;
        const contactData = req.body;
        const contactId = await buyerContactService.create(buyerId, contactData);
        res.status(201).json({ id: contactId, message: 'Buyer contact created successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create buyer contact.' });
    }
}

async function getAll(req, res) {
    try {
        const contacts = await buyerContactService.getAll();
        if (contacts.length === 0) {
            return res.status(204).send("No buyer contacts found");
        }
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error in getAll controller:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to retrieve buyer contacts.' });
    }
}

async function getByBuyerId(req, res) {
    try {
        const { buyerId } = req.params;
        const contacts = await buyerContactService.getByBuyerId(buyerId);
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve buyer contacts for the specified buyer.' });
    }
}

async function update(req, res) {
    try {
        const { contactId } = req.params;
        const contactData = req.body;
        const success = await buyerContactService.update(contactId, contactData);
        if (success) {
            res.status(200).json({ message: 'Buyer contact updated successfully.' });
        } else {
            res.status(404).json({ error: 'Buyer contact not found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update buyer contact.' });
    }
}

// async function remove(req, res) {
//     try {
//         const { contactId } = req.params;
//         const success = await buyerContactService.remove(contactId);
//         if (success) {
//             res.status(200).json({ message: 'Buyer contact deleted successfully.' });
//         } else {
//             res.status(404).json({ error: 'Buyer contact not found.' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to delete buyer contact.' });
//     }
// }

module.exports = {
    create,
    getAll,
    getByBuyerId,
    update,
    // remove
};
