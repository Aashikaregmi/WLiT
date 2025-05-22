const express = require('express');
const router = express.Router();
const Bus = require('../models/buses.js');

router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find({});
    res.render('admin/buses', { title: 'AashikaRegmi', busList: buses });  // updated path
  } catch (err) {
    res.status(500).send("Error fetching buses");
  }
});

router.get('/add', (req, res) => {
  res.render('admin/addBus', { title: 'Add Bus' });  // updated path
});

router.post('/save', async (req, res) => {
  try {
    const timeString = req.body.departureTime; // format: "HH:mm"
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    const departureDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    const busData = {
      busNumber: req.body.busNumber,
      pickUp: req.body.pickUp,
      destination: req.body.destination,
      fare: req.body.fare,
      departureTime: departureDate,
    };

    await Bus.create(busData);
    res.redirect('/buses');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


router.get('/edit/:_id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params._id);
    if (!bus) {
      return res.status(404).send("Bus not found");
    }
    res.render('admin/editBuses', { title: 'Edit Bus', bus });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


router.post('/saveEdited/:_id', async (req, res) => {
  const { busNumber, pickUp, destination, departureTime, fare } = req.body;

  const today = new Date().toISOString().split('T')[0]; // e.g., "2025-05-22"
  const departure = new Date(`${today}T${departureTime}`); // e.g., "2025-05-22T08:00"

  try {
    await Bus.findByIdAndUpdate(req.params._id, {
      busNumber,
      pickUp,
      destination,
      departureTime: departure,
      fare,
    });

    res.redirect('/buses'); // 
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving bus update');
  }
});

module.exports = router;

