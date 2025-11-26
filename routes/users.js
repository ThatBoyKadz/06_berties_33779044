// routes/users.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// express-validator
const { check, validationResult } = require("express-validator");

// ------------------------
// Middleware: Protect routes
// ------------------------
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("/users/login"); // redirect to login if not logged in
    } else {
        next();
    }
};

// ------------------------
// GET: Registration Page
// ------------------------
router.get("/register", (req, res) => {
    res.render("register.ejs", { 
        shopData: { shopName: "My Shop" }, 
        errors: [], 
        oldInput: {} 
    });
});

// ------------------------
// POST: Registered (with validation & sanitization)
// ------------------------
router.post(
    "/registered",
    [
        check("email").isEmail().withMessage("Please enter a valid email."),
        check("username").isLength({ min: 5, max: 20 }).withMessage("Username must be 5–20 characters."),
        check("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
        check("first").notEmpty().withMessage("First name is required."),
        check("last").notEmpty().withMessage("Last name is required.")
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("register", {
                errors: errors.array(),
                shopData: { shopName: "My Shop" },
                oldInput: req.body
            });
        }

        // Sanitize inputs
        const username = req.sanitize(req.body.username);
        const password = req.sanitize(req.body.password);
        const first = req.sanitize(req.body.first);
        const last = req.sanitize(req.body.last);
        const email = req.sanitize(req.body.email);

        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return next(err);

            const sql = `
                INSERT INTO users (username, first, last, email, hashedPassword)
                VALUES (?, ?, ?, ?, ?)
            `;
            const params = [username, first, last, email, hashedPassword];

            db.query(sql, params, (err, result) => {
                if (err) return next(err);

                const output = `
                    <h2>Hello ${first} ${last}, you are now registered!</h2>
                    <p>Your password is: ${password}</p>
                    <p>Your hashed password is: ${hashedPassword}</p>
                    <p><a href="/users/login">Click here to login</a></p>
                `;
                res.send(output);
            });
        });
    }
);

// ------------------------
// GET: List Users (protected)
// ------------------------
router.get("/list", redirectLogin, (req, res, next) => {
    const sql = "SELECT username, first, last, email FROM users";
    db.query(sql, (err, results) => {
        if (err) return next(err);
        res.render("users_list.ejs", { users: results });
    });
});

// ------------------------
// GET: Login Page
// ------------------------
router.get("/login", (req, res) => {
    res.render("login.ejs", { shopData: { shopName: "My Shop" } });
});

// ------------------------
// POST: Handle Login
// ------------------------
router.post("/loggedin", (req, res, next) => {
    const usernameInput = req.sanitize(req.body.username);
    const passwordInput = req.sanitize(req.body.password);

    const sql = "SELECT id, hashedPassword, first, last FROM users WHERE username = ?";
    db.query(sql, [usernameInput], (err, results) => {
        if (err) return next(err);

        if (results.length === 0) {
            return res.send("Login failed: username not found");
        }

        const user = results[0];
        const success = bcrypt.compareSync(passwordInput, user.hashedPassword);

        // Insert audit record
        const auditSql = "INSERT INTO audit (username, success) VALUES (?, ?)";
        db.query(auditSql, [usernameInput, success], (err2) => {
            if (err2) console.error("Audit logging error:", err2);

            if (success) {
                // Save session
                req.session.userId = user.id;
                req.session.username = usernameInput;
                res.send(`Login successful! Welcome back ${user.first} ${user.last}.`);
            } else {
                res.send("Login failed: incorrect password");
            }
        });
    });
});

// ------------------------
// GET: Audit log (protected)
// ------------------------
router.get("/audit", redirectLogin, (req, res, next) => {
    const sql = "SELECT * FROM audit ORDER BY timestamp DESC";
    db.query(sql, (err, results) => {
        if (err) return next(err);
        res.render("audit.ejs", { audits: results });
    });
});

// ------------------------
// GET: Dashboard (protected)
// ------------------------
router.get("/dashboard", redirectLogin, (req, res) => {
    res.render("dashboard.ejs", { username: req.session.username });
});

// ------------------------
// GET: Logout (protected)
// ------------------------
router.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect("/users/dashboard");
        res.clearCookie("connect.sid");
        res.redirect("/users/login");
    });
});

module.exports = router;
