const express = require('express');
const router = express.Router();
const Bus = require('../models/buses');
const User = require('../models/users');

// Mock user middleware
const mockUser = async (req, res, next) => {
  try {
    const mockUserId = '683553e54d31562ec4620f48';
    const user = await User.findById(mockUserId).populate('buses.bus');
    if (!user) return res.status(404).send('Mock user not found');
    req.user = user;
    next();
  } catch (err) {
    console.error('Mock user error:', err);
    res.status(500).send('Server error');
  }
};

router.use(mockUser);

// ---------------- ADMIN ROUTES ----------------

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

    if (ampm === 'PM' && hours !== 12) hours += 12;
    else if (ampm === 'AM' && hours === 12) hours = 0;

    const now = new Date();
    const departureTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    await Bus.create({
      busNumber: req.body.busNumber,
      pickUp: req.body.pickUp,
      destination: req.body.destination,
      fare: req.body.fare,
      departureTime,
    });

    res.redirect('/buses');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/edit/:_id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params._id);
    if (!bus) return res.status(404).send("Bus not found");
    res.render('admin/editBuses', { title: 'Edit Bus', bus });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post('/saveEdited/:id', async (req, res) => {
  try {
    let hour24 = parseInt(req.body.departureHour);
    const minuteNum = parseInt(req.body.departureMinute);
    const ampm = req.body.ampm;

    if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
    if (ampm === 'AM' && hour24 === 12) hour24 = 0;

    const departureTime = new Date();
    departureTime.setHours(hour24, minuteNum, 0, 0);

    await Bus.findByIdAndUpdate(req.params.id, {
      busNumber: req.body.busNumber,
      pickUp: req.body.pickUp,
      destination: req.body.destination,
      fare: req.body.fare,
      departureTime,
    });

    res.redirect('/buses');
  } catch (err) {
    console.error('Error updating bus:', err);
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

// ---------------- USER ROUTES ----------------

// Show bus filter form
router.get('/user', async (req, res) => {
  try {
    const now = new Date();
    const buses = await Bus.find({ departureTime: { $gte: now } });
    res.render('dashboard/selectBus', { buses, pickup: '' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

// Filter buses by pickup location
router.get('/user/filter', async (req, res) => {
  try {
    const pickup = req.query.pickup;
    if (!pickup) return res.status(400).send("Pickup location is required");

    const buses = await Bus.find({ pickUp: { $regex: `^${pickup}$`, $options: 'i' } });
    res.render('dashboard/buses', { pickup, buses, currentUrl: '/buses/user/filter' });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// FIXED: Add selected bus to user's profile - use 'caught' as initial status (neutral)
router.post('/user/select/:id', async (req, res) => {
  try {
    const busId = req.params.id;
    
    console.log('Selecting bus with ID:', busId);
    
    // Validate bus ID format
    if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid bus ID format');
      return res.status(400).send('Invalid bus ID format');
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      console.log('Bus not found');
      return res.status(404).send('Bus not found');
    }

    const user = req.user;
    if (!user) {
      console.log('User not found');
      return res.status(401).send('User not authenticated');
    }

    console.log('Current user buses:', user.buses);
    
    // Check if bus is already selected
    const alreadySelected = user.buses.some(entry => {
      const entryBusId = entry.bus._id ? entry.bus._id.toString() : entry.bus.toString();
      return entryBusId === busId;
    });

    if (alreadySelected) {
      console.log('Bus already selected');
      return res.redirect('/buses/profile?message=Bus already selected');
    }

    // Add bus with default status - will be updated later via modal
    user.buses.push({ 
      bus: bus._id
      // status defaults to 'caught' but will be updated when timer ends
    });
    
    await user.save();
    
    console.log('Bus successfully selected');
    res.redirect('/buses/profile?message=Bus selected successfully');
    
  } catch (err) {
    console.error('Error selecting bus:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

// FIXED: Cancel a booked bus - only increment cancelled counter, remove bus completely
router.post('/user/cancel/:id', async (req, res) => {
  try {
    const busId = req.params.id;
    const user = req.user;

    console.log('Cancelling bus with ID:', busId);

    // Validate bus ID format
    if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send('Invalid bus ID format');
    }

    // Check if bus exists in user's selection
    const busExists = user.buses.some(entry => {
      const entryBusId = entry.bus._id ? entry.bus._id.toString() : entry.bus.toString();
      return entryBusId === busId;
    });

    if (!busExists) {
      return res.status(404).send('Bus not found in your selections');
    }

    // Increment cancelled counter in stats
    user.stats.cancelled = (user.stats.cancelled || 0) + 1;

    // Remove bus completely from user's selected buses
    user.buses = user.buses.filter(entry => {
      const entryBusId = entry.bus._id ? entry.bus._id.toString() : entry.bus.toString();
      return entryBusId !== busId;
    });
    
    await user.save();

    console.log('Bus successfully cancelled');
    res.redirect('/buses/profile?message=Bus cancelled successfully');
    
  } catch (err) {
    console.error('Error cancelling bus:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

// Profile page - show all selected buses (regardless of status)
router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    const currentTime = new Date();

    console.log('Loading profile for user:', user._id);
    console.log('User buses count:', user.buses.length);

    const validBuses = [];
    const invalidBusIds = [];

    for (const entry of user.buses) {
      const bus = entry.bus;
      
      // Handle case where bus might not be populated
      if (!bus || !bus.departureTime) {
        console.log('Invalid bus entry:', entry);
        invalidBusIds.push(entry.bus);
        continue;
      }

      const departureTime = new Date(bus.departureTime);
      if (isNaN(departureTime.getTime())) {
        console.log('Invalid departure time for bus:', bus._id);
        invalidBusIds.push(bus._id.toString());
        continue;
      }

      // Calculate time difference
      const diffInMinutes = Math.floor((departureTime - currentTime) / (1000 * 60));
      validBuses.push({
        ...bus.toObject(),
        departureInMinutes: diffInMinutes,
        status: entry.status || 'caught'
      });
    }

    // Remove invalid buses from profile
    if (invalidBusIds.length > 0) {
      user.buses = user.buses.filter(entry => {
        const busId = entry.bus._id ? entry.bus._id.toString() : entry.bus.toString();
        return !invalidBusIds.includes(busId);
      });
      await user.save();
    }

    const stats = {
      caught: user.stats.caught || 0,
      missed: user.stats.missed || 0,
      cancelled: user.stats.cancelled || 0,
    };

    console.log('Profile stats:', stats);
    console.log('Valid buses count:', validBuses.length);

    const showAlert = validBuses.some(b => b.departureInMinutes <= 30 && b.departureInMinutes > 5);
    const showAlarm = validBuses.some(b => b.departureInMinutes <= 5 && b.departureInMinutes > 0);

    res.render('dashboard/profile', { 
      selectedBuses: validBuses, 
      stats, 
      showAlert, 
      showAlarm,
      message: req.query.message || null
    });
    
  } catch (err) {
    console.error('Error loading profile:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

// FIXED: Update caught/missed status ONLY when user responds to modal
router.post('/user/updateStatus', async (req, res) => {
  try {
    const { busId, caught } = req.body;
    const user = req.user;

    console.log('Updating status for bus:', busId, 'caught:', caught);

    if (!busId || typeof caught !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data' 
      });
    }

    // Validate bus ID format
    if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid bus ID format' 
      });
    }

    // Find the bus entry in user's buses
    const busEntry = user.buses.find(entry => {
      const entryBusId = entry.bus._id ? entry.bus._id.toString() : entry.bus.toString();
      return entryBusId === busId;
    });

    if (!busEntry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bus not found in your selections' 
      });
    }

    // Update the status and stats based on user response
    if (caught) {
      busEntry.status = 'caught';
      user.stats.caught = (user.stats.caught || 0) + 1;
    } else {
      busEntry.status = 'missed';
      user.stats.missed = (user.stats.missed || 0) + 1;
    }

    // Remove the bus from user's selection after updating stats
    user.buses = user.buses.filter(entry => {
      const entryBusId = entry.bus._id ? entry.bus._id.toString() : entry.bus.toString();
      return entryBusId !== busId;
    });

    await user.save();

    console.log('Status updated successfully');

    res.json({ 
      success: true, 
      message: `Bus ${caught ? 'caught' : 'missed'} successfully`,
      stats: user.stats
    });

  } catch (error) {
    console.error('Error updating bus status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error: ' + error.message
    });
  }
});

router.get('/user/missed/:busId', async (req, res) => {
  try {
    const busId = req.params.busId;
    const user = req.user;

    // Validate bus ID format
    if (!busId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send('Invalid bus ID format');
    }

    // Find the bus entry in user.buses
    let busEntry = user.buses.find(entry => {
      const entryBusId = entry.bus._id ? entry.bus._id.toString() : entry.bus.toString();
      return entryBusId === busId;
    });

    if (!busEntry) {
      // If not found, add new with missed status
      user.buses.push({ bus: busId, status: 'missed' });
    } else {
      // Update status to missed
      busEntry.status = 'missed';
    }

    // Update stats counts
    user.stats.missed = (user.stats.missed || 0) + 1;

    await user.save();

    res.redirect('/buses/profile');
  } catch (err) {
    console.error('Error marking bus as missed:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

// ---------------- STATIC PAGES ----------------

router.get('/about', (req, res) => {
  res.render('about', { currentUrl: '/about' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { currentUrl: '/contact' });
});

module.exports = router;





