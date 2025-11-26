// routes/users.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

// NEW: express-validator (required)
const { check, validationResult } = require("express-validator");

// ------------------------
// Middleware: Protect routes
// ------------------------
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("./login"); // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
};

// ------------------------
// GET: Registration Page
// ------------------------
router.get("/register", function (req, res) {
    res.render("register.ejs", { shopData: { shopName: "My Shop" }, errors: [], oldInput: {} });
});

// ------------------------
// POST: Registered (with validation)
// ------------------------
router.post(
  "/registered",
  [
    check("email").isEmail().withMessage("Please enter a valid email."),
    check("username")
      .isLength({ min: 5, max: 20 })
      .withMessage("Username must be 5–20 characters."),
    check("password").isLength({ min: 5 }).withMessage("Password must be at least 5 characters."),
    check("first").notEmpty().withMessage("First name is required."),
    check("last").notEmpty().withMessage("Last name is required.")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Pass errors and old input to template
      return res.render("register", {
        errors: errors.array(),
        shopData: { shopName: "My Shop" },
        oldInput: req.body
      });
    }

    // No validation errors → continue with registration
    const { username, password, first, last, email } = req.body;

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
router.get("/list", redirectLogin, function (req, res, next) {
    const sql = "SELECT username, first, last, email FROM users";
    db.query(sql, function (err, results) {
        if (err) return next(err);
        res.render("users_list.ejs", { users: results });
    });
});

// ------------------------
// GET: Login Page
// ------------------------
router.get("/login", function (req, res) {
    res.render("login.ejs", { shopData: { shopName: "My Shop" } });
});

// ------------------------
// POST: Handle Login
// ------------------------
router.post("/loggedin", function (req, res, next) {
    const { username, password } = req.body;

    const sql = "SELECT id, hashedPassword, first, last FROM users WHERE username = ?";
    db.query(sql, [username], function (err, results) {
        if (err) return next(err);

        if (results.length === 0) {
            return res.send("Login failed: username not found");
        }

        const user = results[0];
        const success = bcrypt.compareSync(password, user.hashedPassword);

        // Insert audit record
        const auditSql = "INSERT INTO audit (username, success) VALUES (?, ?)";
        db.query(auditSql, [username, success], function (err2) {
            if (err2) console.error("Audit logging error:", err2);

            if (success) {
                // --- Save user session here ---
                req.session.userId = user.id;
                req.session.username = username;
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
router.get("/audit", redirectLogin, function (req, res, next) {
    const sql = "SELECT * FROM audit ORDER BY timestamp DESC";
    db.query(sql, function (err, results) {
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
// POST: Logout (protected)
// ------------------------
router.post("/logout", redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect("/users/dashboard");
        }
        res.clearCookie("connect.sid"); // clear session cookie
        res.redirect("/users/login");
    });
});

module.exports = router;
