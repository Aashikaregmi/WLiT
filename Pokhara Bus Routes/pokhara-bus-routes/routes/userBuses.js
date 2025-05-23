const express = require('express');
const router = express.Router();
const Bus = require('../models/buses.js');

router.get('/', async (req, res) => {
  try {
    //find buses
    const buses = await Bus.find({});
    res.render('dashboard/buses', { title: 'AashikaRegmi', busList: buses });  // updated path
  } catch (err) {
    res.status(500).send("Error fetching buses");
  }
});



module.exports = router;