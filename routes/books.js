// Create a new router
const express = require("express")
const router = express.Router()

router.get('/search', function(req, res, next) {
    res.render("search.ejs")
});

router.get('/search-result', function (req, res, next) {
    //searching in the database
    res.send("You searched for: " + req.query.keyword)
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
        res.send(result); // send the list of books as JSON
    });
});

// Export the router object so index.js can access it
module.exports = router
