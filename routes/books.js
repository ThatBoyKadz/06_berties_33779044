// Create a new router
const express = require("express")
const router = express.Router()

router.get('/search', function(req, res, next) {
    res.render("search.ejs")
});

router.get('/search-result', function (req, res, next) {
    let keyword = req.query.keyword;  // get the keyword from the form
    let sqlquery = "SELECT * FROM books WHERE name = ?";  // exact match

    db.query(sqlquery, [keyword], (err, result) => {
        if (err) {
            next(err);
        } else {
            res.render("search-results.ejs", { books: result, searchTerm: keyword });
        }
    });
});


// 👇 Add this new route here
router.get('/list', function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.redirect('/'); // redirect home if there’s an error
        }
        res.render("list.ejs", {availableBooks:result})
    });
});

router.get('/addbook', function (req, res, next) {
    res.render("addbook.ejs");
});

router.post('/bookadded', function (req, res, next) {
    // SQL query to insert a new book
    let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    let newrecord = [req.body.name, req.body.price];

    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.send(`Book added to database!<br><br>
                      Name: ${req.body.name}<br>
                      Price: £${req.body.price}<br><br>
                      <a href="/books/list">Back to list</a>`);
        }
    });
});

// Show all bargain books (priced under £20)
router.get('/bargainbooks', function (req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20";

    db.query(sqlquery, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            next(err);
        } else {
            res.render("bargainbooks.ejs", { cheapBooks: result });
        }
    });
});



// Export the router object so index.js can access it
module.exports = router
