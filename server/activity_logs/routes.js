const express = require('express');
const activitylogController = require('./controllers');
const router = express.Router();

// Get all activity logs
router.get('/activity-logs', activitylogController.getAll);

// Create an activity log
router.post('/activity-logs', activitylogController.create);

// Get activity log by ID
router.get('/activity-logs/:id', activitylogController.getById);

// Update an activity log
router.put('/activity-logs/:id', activitylogController.update);

// Delete an activity log
// router.delete('/activity-logs/:id', activitylogController.remove);

module.exports = router;