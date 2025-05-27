const express = require('express');
const router = express.Router();

// --- Landing Page ---
router.get('/', (req, res) => {
    res.render('authorization/index');
});

// --- Login Page ---
router.get('/login', (req, res) => {
    // You can optionally pass a mock error/success message here for testing front-end display
    res.render('authorization/login', {
        title: 'Login',
        pageHeader: 'Login to Your Account',
        errorMessage: null, // Set to a string like 'Invalid credentials!' to test
        successMessage: null // Set to a string like 'Logged in successfully!' to test
    });
});

// --- Handle Login POST (MOCKED) ---
router.post('/login', (req, res) => {
    // In a real app, you'd validate credentials here.
    // For now, we'll just simulate a successful login and redirect.
    console.log('Mock Login Attempt:', req.body.username);
    // Simulate setting a session user (optional, for layout.ejs nav bar)
    // req.session.user = { id: 'mockUserId', username: req.body.username, role: 'user' };
    res.redirect('/user'); // Redirect to user dashboard
});

// --- Sign Up Page ---
router.get('/signup', (req, res) => {
    res.render('authorization/signUp', {
        title: 'Sign Up',
        pageHeader: 'Create Your Account',
        errorMessage: null, // Set to a string like 'Passwords do not match!' to test
    });
});

// --- Handle Sign Up POST (MOCKED) ---
router.post('/signup', (req, res) => {
    // In a real app, you'd save user to DB and hash password.
    // For now, just simulate success and redirect to login.
    console.log('Mock Signup Attempt:', req.body.username);
    res.render('authorization/login', {
        title: 'Login',
        pageHeader: 'Login to Your Account',
        successMessage: 'Registration successful! Please log in (mocked).'
    });
});

// --- Logout Route (MOCKED) ---
router.get('/logout', (req, res) => {
    // In a real app, you'd destroy the session.
    // If you used req.session.user, uncomment req.session.destroy
    // req.session.destroy(err => {
    //     if (err) console.error('Error destroying session:', err);
    //     res.redirect('/login');
    // });
    console.log('Mock Logout');
    res.redirect('/login'); // Redirect to login page after mock logout
});

module.exports = router;