// Import modules
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const expressSanitizer = require('express-sanitizer');

// Create the express app
const app = express();
const port = 8000;

// -----------------
// Middleware
// -----------------

// Body parser
app.use(express.urlencoded({ extended: true }));

// Sanitizer (must come after body parser)
app.use(expressSanitizer());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// EJS
app.set('view engine', 'ejs');

// Session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 600000 }
}));

// -----------------
// App locals
// -----------------
app.locals.shopData = { shopName: "Bertie's Books" };

// -----------------
// Database
// -----------------
const db = mysql.createPool({
    host: 'localhost',
    user: 'berties_books_app',
    password: 'qwertyuiop',
    database: 'berties_books',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
global.db = db;

// -----------------
// Routes
// -----------------
const mainRoutes = require("./routes/main");
app.use('/', mainRoutes);

const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const booksRoutes = require('./routes/books');
app.use('/books', booksRoutes);

// -----------------
// Start server
// -----------------
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
