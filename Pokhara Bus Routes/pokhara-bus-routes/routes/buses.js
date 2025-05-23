const express = require('express');
const router = express.Router();
const Bus = require('../models/buses.js');
const User = require('../models/users'); // Adjust path if your file is named differently


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
    let hours = parseInt(req.body.departureHour);
const minutes = parseInt(req.body.departureMinute);
const ampm = req.body.ampm;

if (ampm === 'PM' && hours !== 12) {
  hours += 12;
} else if (ampm === 'AM' && hours === 12) {
  hours = 0;
}

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
  const { busNumber, pickUp, destination, hour, minute, ampm, fare } = req.body;

  let hourInt = parseInt(hour, 10);
  const minuteInt = parseInt(minute, 10);

  if (ampm === 'PM' && hourInt < 12) hourInt += 12;
  if (ampm === 'AM' && hourInt === 12) hourInt = 0;

  const now = new Date();
  const departure = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hourInt,
    minuteInt
  );

  try {
    await Bus.findByIdAndUpdate(req.params._id, {
      busNumber,
      pickUp,
      destination,
      departureTime: departure,
      fare,
    });

    res.redirect('/buses');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving bus update');
  }
});


router.post('/saveDeleted/:_id', async (req, res) => {
  try {
    await Bus.findByIdAndDelete(req.params._id);
    res.redirect('/buses');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting bus');
  }
});

//USER ROUTES ONLY

// Show buses for users (profile page)
router.get('/user', async (req, res) => {
  try {
    const now = new Date();
    const buses = await Bus.find({ departureTime: { $gte: now } }); // Only future buses
    res.render('dashboard/selectBus', { buses });
  } catch (err) {
    console.error('Error fetching page for user:', err);
    res.status(500).send("Something went wrong");
  }
});

router.get('/profile', async (req, res) => {
  // Let's assume you're storing selected buses in the user profile
  const user = await User.findById(req.session.userId).populate('buses');

  const currentTime = new Date();
  const busesWithTime = user.buses.map(bus => {
    const departureTime = new Date(bus.departureTime); // Make sure this is a Date
    const diffInMinutes = Math.floor((departureTime - currentTime) / (1000 * 60));
    return {
      ...bus.toObject(), // if it's a Mongoose doc
      departureInMinutes: diffInMinutes
    };
  });

  // Check alert and alarm conditions
  let showAlert = false;
  let showAlarm = false;
  for (const bus of busesWithTime) {
    if (bus.departureInMinutes <= 30 && bus.departureInMinutes > 5) {
      showAlert = true;
    } else if (bus.departureInMinutes <= 5 && bus.departureInMinutes > 0) {
      showAlarm = true;
    }
  }

  res.render('dashboard/profile', {
    buses: busesWithTime,
    showAlert,
    showAlarm
  });
});



// Show buses filtered by pickup point
router.get('/user/filter', async (req, res) => {
  const { pickup } = req.query;

  try {
    const now = new Date();
    const filteredBuses = await Bus.find({
      pickUp: pickup,
      departureTime: { $gte: now }, // Only future buses
    });

    res.render('dashboard/buses', { buses: filteredBuses, pickup });
  } catch (err) {
    console.error('Error filtering buses:', err);
    res.status(500).send("Failed to fetch buses");
  }
});

router.post('/user/select/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).send("Bus not found");

    // Calculate time difference
    const now = new Date();
    const departureTime = new Date(bus.departureTime);
    const diffMinutes = Math.floor((departureTime - now) / (1000 * 60));

    res.render('dashboard/profile', {
      buses: [bus],
      showAlert: diffMinutes <= 30 && diffMinutes > 5,
      showAlarm: diffMinutes <= 5,
      departureInMinutes: diffMinutes
    });
  } catch (err) {
    console.error('Error selecting bus:', err);
    res.status(500).send("Server error");
  }
});

module.exports = router;

