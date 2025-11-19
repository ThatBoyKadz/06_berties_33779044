// routes/users.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// ------------------------
// GET: Registration Page
// ------------------------
router.get("/register", function (req, res, next) {
    res.render("register.ejs", { shopData: { shopName: "My Shop" } });
});

// ------------------------
// POST: Registered
// ------------------------
router.post("/registered", function (req, res, next) {
    const { username, password, first, last, email } = req.body;

    bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
        if (err) return next(err);

        const sql = `
            INSERT INTO users (username, first, last, email, hashedPassword)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [username, first, last, email, hashedPassword];

        db.query(sql, params, function (err, result) {
            if (err) return next(err);

            let output = `Hello ${first} ${last}, you are now registered!<br>`;
            output += `Your password is: ${password} and your hashed password is: ${hashedPassword}`;
            res.send(output);
        });
    });
});

// ------------------------
// GET: List Users
// ------------------------
router.get("/list", function (req, res, next) {
    const sql = "SELECT username, first, last, email FROM users";
    db.query(sql, function (err, results) {
        if (err) return next(err);
        res.render("users_list.ejs", { users: results });
    });
});

// ------------------------
// GET: Login Page
// ------------------------
router.get("/login", function (req, res, next) {
    res.render("login.ejs", { shopData: { shopName: "My Shop" } });
});

// ------------------------
// POST: Handle Login
// ------------------------
router.post("/loggedin", function (req, res, next) {
    const { username, password } = req.body;

    const sql = "SELECT hashedPassword, first, last FROM users WHERE username = ?";
    db.query(sql, [username], function (err, results) {
        if (err) return next(err);

        let success = false;
        let message = "";

        if (results.length === 0) {
            // Username not found
            message = " Login failed: username not found";
        } else {
            const hashedPassword = results[0].hashedPassword;
            const first = results[0].first;
            const last = results[0].last;

            success = bcrypt.compareSync(password, hashedPassword); // synchronous for simplicity
            if (success) {
                message = ` Login successful! Welcome back ${first} ${last}.`;
            } else {
                message = " Login failed: incorrect password";
            }
        }

        // Insert audit record
        const auditSql = "INSERT INTO audit (username, success) VALUES (?, ?)";
        db.query(auditSql, [username, success], function (err2) {
            if (err2) console.error("Audit logging error:", err2);
            res.send(message);
        });
    });
});

// ------------------------
// GET: Audit log
// ------------------------
router.get("/audit", function (req, res, next) {
    const sql = "SELECT * FROM audit ORDER BY timestamp DESC";
    db.query(sql, function (err, results) {
        if (err) return next(err);
        res.render("audit.ejs", { audits: results });
    });
});

module.exports = router;
