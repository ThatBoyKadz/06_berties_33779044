// Create a new router
const express = require("express");
const router = express.Router();

// ----------------------------
// SEARCH ROUTES
// ----------------------------

// Display search form
router.get('/search', function (req, res, next) {
    res.render("search.ejs");
});

// Handle search results (advanced: partial match)
router.get('/search-result', function (req, res, next) {
    const keyword = req.query.keyword;  // get the keyword from the form

    // If no keyword entered
    if (!keyword || keyword.trim() === "") {
        return res.send("❌ Please enter a book name to search.");
    }

    // SQL query for partial match search
    const sqlquery = "SELECT * FROM books WHERE name LIKE ?";

    // Execute query
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
// LIST ALL BOOKS
// ----------------------------

router.get('/list', function (req, res, next) {
    const sqlquery = "SELECT * FROM books"; // query database to get all the books
    db.query(sqlquery, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.redirect('/'); // redirect home if there’s an error
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

// ----------------------------
// ADD BOOK
// ----------------------------

// Display Add Book form
router.get('/addbook', function (req, res, next) {
    res.render("addbook.ejs");
});

// Handle Add Book form submission
router.post('/bookadded', function (req, res, next) {
    const sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    const newrecord = [req.body.name, req.body.price];

    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            console.error("Database insert error:", err);
            next(err);
        } else {
            res.send(`
                <h2>✅ Book added to database!</h2>
                <p><strong>Name:</strong> ${req.body.name}</p>
                <p><strong>Price:</strong> £${req.body.price}</p>
                <p><a href="/books/list">Back to Book List</a></p>
            `);
        }
    });
});

// ----------------------------
// BARGAIN BOOKS (UNDER £20)
// ----------------------------

router.get('/bargainbooks', function (req, res, next) {
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
// EXPORT ROUTER
// ----------------------------

module.exports = router;
