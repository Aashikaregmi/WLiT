const express = require('express');
const router = express.Router();
const Bus = require('../models/buses.js');

// GET /admin
router.get('/', async (req, res, next) => {
  try {
    const busList = await Bus.find(); // Fetch buses from MongoDB
    res.render('admin/admin', { busList }); // Pass to EJS
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving bus data');
  }
});

module.exports = router;

