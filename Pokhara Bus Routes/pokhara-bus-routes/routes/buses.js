const express = require('express');
const router = express.Router();
const Bus = require('../models/buses.js');
const User = require('../models/users');

// Inline mock user middleware
const mockUser = async (req, res, next) => {
  try {
    const mockUserId = '68306f5d9f7d772cd76e7ea9'; // Replace with your mock _id
    const user = await User.findById(mockUserId).populate('buses');
    if (!user) return res.status(404).send('Mock user not found');
    req.user = user;
    next();
  } catch (err) {
    console.error('Mock user middleware error:', err);
    res.status(500).send('Server error');
  }
};

router.use(mockUser); // Apply it globally to all routes

// Admin Routes
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find({});
    res.render('admin/buses', { title: 'AashikaRegmi', busList: buses });
  } catch (err) {
    res.status(500).send("Error fetching buses");
  }
});

router.get('/add', (req, res) => {
  res.render('admin/addBus', { title: 'Add Bus' });
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

router.post('/saveEdited/:id', async (req, res) => {
  try {
    const { busNumber, pickUp, destination, fare, departureHour, departureMinute, ampm } = req.body;

    let hour24 = parseInt(departureHour, 10);
    const minuteNum = parseInt(departureMinute, 10);

    if (ampm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    if (ampm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const departureTime = new Date();
    departureTime.setHours(hour24, minuteNum, 0, 0);

    await Bus.findByIdAndUpdate(req.params.id, {
      busNumber,
      pickUp,
      destination,
      fare,
      departureTime,
    });

    res.redirect('/buses');
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(500).send('Server Error');
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

// USER ROUTES

// Show buses for users (profile page)
router.get('/user', async (req, res) => {
  try {
    const now = new Date();
    const buses = await Bus.find({ departureTime: { $gte: now } }); // Only future buses
    res.render('dashboard/selectBus', { buses, pickup: '' });
  } catch (err) {
    console.error('Error fetching page for user:', err);
    res.status(500).send("Something went wrong");
  }
});

router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    const currentTime = new Date();

    const busesWithTime = user.buses.map(bus => {
      const departureTime = new Date(bus.departureTime);
      const diffInMinutes = Math.floor((departureTime - currentTime) / (1000 * 60));
      return {
        ...bus.toObject(),
        departureInMinutes: diffInMinutes
      };
    });

    // Stats
    const stats = { caught: 0, missed: 0, cancelled: 0 };
    for (const bus of busesWithTime) {
      if (bus.departureInMinutes > 0) {
        stats.caught++;
      } else if (bus.departureInMinutes <= 0) {
        stats.missed++;
      }
      // You could check for bus.cancelled here to increment stats.cancelled
    }

    const showAlert = busesWithTime.some(b => b.departureInMinutes <= 30 && b.departureInMinutes > 5);
    const showAlarm = busesWithTime.some(b => b.departureInMinutes <= 5 && b.departureInMinutes > 0);

    res.render('dashboard/profile', {
      buses: busesWithTime,
      showAlert,
      showAlarm,
      stats,
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).send('Server error');
  }
});

// Show buses filtered by pickup point
router.get('/user/filter', async (req, res) => {
  try {
    const pickup = req.query.pickup;

    if (!pickup) {
      return res.status(400).send("Pickup location is required");
    }

    // Case-insensitive exact match with regex
    const buses = await Bus.find({ pickUp: { $regex: `^${pickup}$`, $options: 'i' } });

    res.render('dashboard/buses', {
      pickup,
      buses,
      currentUrl: '/buses/user/filter',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// User selects a bus to add to profile & show alert/alarm
router.post('/user/select/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).send("Bus not found");

    const user = req.user;

    // Add bus to user's buses if not already added
    if (!user.buses.some(b => b._id.toString() === bus._id.toString())) {
      user.buses.push(bus._id);
      await user.save();
    }

    const now = new Date();
    const departureTime = new Date(bus.departureTime);
    const diffMinutes = Math.floor((departureTime - now) / (1000 * 60));

    res.render('dashboard/profile', {
      buses: [bus],
      showAlert: diffMinutes <= 30 && diffMinutes > 5,
      showAlarm: diffMinutes <= 5,
      departureInMinutes: diffMinutes,
      stats: { caught: 1, missed: 0, cancelled: 0 } // Basic fallback for this route
    });
  } catch (err) {
    console.error('Error selecting bus:', err);
    res.status(500).send("Server error");
  }
});

// About & Contact Pages
router.get('/about', (req, res) => {
  res.render('about', { currentUrl: '/about' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { currentUrl: '/contact' });
});

// Cancel booked bus for user
router.post('/user/cancel/:id', async (req, res) => {
  try {
    const busId = req.params.id;
    const user = req.user;

    user.buses = user.buses.filter(bid => bid.toString() !== busId);
    await user.save();

    res.redirect('/buses/profile');
  } catch (err) {
    console.error('Error cancelling bus:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;



