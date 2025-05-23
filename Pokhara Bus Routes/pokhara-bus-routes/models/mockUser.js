const mongoose = require('mongoose');
const User = require('./users'); // path ok?

mongoose.connect('mongodb+srv://aashikaregmi1234:fZTybGcEwmJiaJ0e@pokhara-bus-routes.l00ffuc.mongodb.net/?retryWrites=true&w=majority&appName=Pokhara-Bus-Routes', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function insertMockUser() {
  try {
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'mockpassword123',
      role: 'user',
      buses: []
    });

    await user.save();
    console.log('Mock user inserted:', user._id);
  } catch (error) {
    console.error('Error inserting user:', error);
  } finally {
    mongoose.disconnect();
  }
}

insertMockUser();


