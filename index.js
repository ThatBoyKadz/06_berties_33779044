require('dotenv').config(); // Load environment variables

const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const expressSanitizer = require('express-sanitizer');
const app = express();
const port = 8000;

// -----------------
// Middleware
// -----------------
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

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

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes); // all API routes will start with /api


// Weather route
const weatherRouter = require('./routes/weather'); // make sure path is correct
app.use('/weather', weatherRouter);

// -----------------
// Start server
// -----------------
app.listen(port, () => console.log(`Server listening on port ${port}!`));
