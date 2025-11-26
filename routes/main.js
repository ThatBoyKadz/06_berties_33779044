// Create a new router
const express = require("express");
const router = express.Router();

// Middleware to protect pages
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/users/login');
    } else {
        next();
    }
};

// Home page
router.get('/', (req, res) => {
    res.render('index.ejs');
});

// About page
router.get('/about', (req, res) => {
    res.render('about.ejs');
});

// ------------------------------
// GET: Logout route (Protected)
// ------------------------------
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./');
        }
        res.clearCookie("connect.sid"); // delete session cookie
        res.send("You are now logged out. <a href='./'>Home</a>");
    });
});

// Export router so index.js can access it
module.exports = router;
