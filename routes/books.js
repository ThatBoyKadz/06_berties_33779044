// books.js
const express = require("express");
const router = express.Router();

// ------------------------
// Middleware: Protect routes
// ------------------------
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect("../users/login"); // redirect to login if not logged in
    } else {
        next(); // continue to the route handler
    }
};

// ----------------------------
// SEARCH ROUTES
// ----------------------------

// Display search form
router.get('/search', redirectLogin, function (req, res, next) {
    res.render("search.ejs");
});

// Handle search results (advanced: partial match)
router.get('/search-result', redirectLogin, function (req, res, next) {
    const keyword = req.query.keyword;  // get the keyword from the form

    if (!keyword || keyword.trim() === "") {
        return res.send(" Please enter a book name to search.");
    }

    const sqlquery = "SELECT * FROM books WHERE name LIKE ?";

    db.query(sqlquery, ['%' + keyword + '%'], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            next(err);
        } else {
            res.render("search-results.ejs", { books: result, searchTerm: keyword });
        }
    });
});

// ----------------------------
// LIST ALL BOOKS (protected)
// ----------------------------
router.get('/list', redirectLogin, function (req, res, next) {
    const sqlquery = "SELECT * FROM books";
    db.query(sqlquery, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.redirect('/');
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

// ----------------------------
// ADD BOOK (protected)
// ----------------------------
router.get('/addbook', redirectLogin, function (req, res, next) {
    res.render("addbook.ejs");
});

router.post('/bookadded', redirectLogin, function (req, res, next) {
    const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    const newrecord = [req.body.name, req.body.price];

    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            console.error("Database insert error:", err);
            next(err);
        } else {
            res.send(`
                <h2> Book added to database!</h2>
                <p><strong>Name:</strong> ${req.body.name}</p>
                <p><strong>Price:</strong> £${req.body.price}</p>
                <p><a href="/books/list">Back to Book List</a></p>
            `);
        }
    });
});

// ----------------------------
// BARGAIN BOOKS (UNDER £20) (protected)
// ----------------------------
router.get('/bargainbooks', redirectLogin, function (req, res, next) {
    const sqlquery = "SELECT * FROM books WHERE price < 20";

    db.query(sqlquery, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            next(err);
        } else {
            res.render("bargainbooks.ejs", { cheapBooks: result });
        }
    });
});

// ----------------------------
// USERS LIST (protected)
// ----------------------------
router.get('/users/list', redirectLogin, function (req, res, next) {
    const sql = "SELECT username, first, last, email FROM users";

    db.query(sql, function (err, results) {
        if (err) return next(err);
        res.render("users_list.ejs", { users: results });
    });
});

// ----------------------------
// AUDIT LOG (protected)
// ----------------------------
router.get("/audit", redirectLogin, function (req, res, next) {
    const sql = "SELECT * FROM audit ORDER BY timestamp DESC";
    db.query(sql, function (err, results) {
        if (err) return next(err);
        res.render("audit.ejs", { audits: results });
    });
});

module.exports = router;
