const mongoose = require('mongoose');
const User = require('./models/users'); // adjust path if needed
const Bus = require('./models/buses');  // adjust path if needed

mongoose.connect('mongodb+srv://aashikaregmi1234:fZTybGcEwmJiaJ0e@pokhara-bus-routes.l00ffuc.mongodb.net/?retryWrites=true&w=majority&appName=Pokhara-Bus-Routes', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function insertMockUserWithBus() {
  try {
    // Create mock bus (departs in 20 minutes)
    const departureTime = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes from now
    const mockBus = new Bus({
      busNumber: 101,
      pickUp: "Lakeside",
      destination: "Mahendrapool",
      fare: 30,
      departureTime: departureTime
    });

    await mockBus.save();

    // Create mock user and link the bus
    const mockUser = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'mockpassword123',
      role: 'user',
      buses: [mockBus._id],
      stats: {
        caught: 2,
        missed: 1,
        cancelled: 0
      }
    });

    await mockUser.save();

    console.log('✅ Mock user created with ID:', mockUser._id);
    console.log('🚌 Linked Bus ID:', mockBus._id);
  } catch (error) {
    console.error('❌ Error inserting mock data:', error);
  } finally {
    mongoose.disconnect();
  }
}

insertMockUserWithBus();



