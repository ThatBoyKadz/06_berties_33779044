const express = require('express');
const router = express.Router();

router.get('/books', function (req, res, next) {
    const searchTerm = req.query.search;
    const minPrice = req.query.minprice;
    const maxPrice = req.query.maxprice;
    const sortField = req.query.sort; // 'name' or 'price'

    let sqlquery = "SELECT * FROM books";
    let conditions = [];
    let params = [];

    // Filters
    if (searchTerm) {
        conditions.push("name LIKE ?");
        params.push(`%${searchTerm}%`);
    }
    if (minPrice) {
        conditions.push("price >= ?");
        params.push(minPrice);
    }
    if (maxPrice) {
        conditions.push("price <= ?");
        params.push(maxPrice);
    }
    if (conditions.length > 0) {
        sqlquery += " WHERE " + conditions.join(" AND ");
    }

    // Sorting
    if (sortField === 'name') {
        sqlquery += " ORDER BY name ASC";
    } else if (sortField === 'price') {
        sqlquery += " ORDER BY price ASC";
    }

    db.query(sqlquery, params, (err, result) => {
        if (err) return next(err);

        // Render HTML table instead of raw JSON
        res.render('api_books.ejs', {
            books: result,
            search: searchTerm,
            minprice: minPrice,
            maxprice: maxPrice,
            sort: sortField
        });
    });
});

module.exports = router;
