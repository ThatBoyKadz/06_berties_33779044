# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

To install and run:

npm install
node index.js


-----------------------------------------------------
#Audit

I have implemented audit logging for all login attempts. Every time a user attempts to log in, the application records:

- The username attempted
- Whether the login was successful or failed
- The timestamp of the attempt

This information is stored in a new `audit` table in MySQL. Users can view the full audit history at `/users/audit`. Successful logins are marked with a yes and failed logins are marked with a No.  

This helps administrators monitor login activity and detect any suspicious access attempts.
-----------------------------------------------------------


Part A: Authorisation

Session Management using express-session.

Access Control: Certain routes are restricted to logged-in users only.

Login & Logout functionality.

Session Handling:

req.session.userId is used to track logged-in users.

Part B: Sanitisation and Validation

Input Validation using express-validator:

Email is validated with isEmail().

Username length is validated with isLength({ min: 5, max: 20 }).

Password length must be at least 8 characters.

Input Sanitisation using express-sanitizer to prevent XSS attacks.

Applied to first name and other relevant form fields



-------------------------------------------------------

Bertie's Books is a Node.js/Express web application that allows users to view, search, and filter books, as well as check the current weather for any city. The application uses MySQL as the database and EJS for templating.

Features
1. Book Routes

View all books in the database.

Search books by name.

Filter books by price range (minprice and maxprice).

Sort books by name or price.

Displays books in a human-friendly HTML table with filters and sorting options.

Example URLs:

All books: http://localhost:8000/api/books

Search: http://localhost:8000/api/books?search=world

Price range: http://localhost:8000/api/books?minprice=5&maxprice=20

Sort by name: http://localhost:8000/api/books?sort=name

Combined: http://localhost:8000/api/books?search=world&minprice=10&maxprice=30&sort=price

2. Weather Route

Route: /weather

Users can enter a city name in a form to view the current weather.

Displays temperature, humidity, weather description, wind speed, and other details.

Handles invalid city names gracefully.

Example URL:

http://localhost:8000/weather

3. User Authentication (Optional)

Protected logout route (/logout) that clears session cookies.

Login redirect for pages requiring authentication.

Technologies Used

Node.js & Express

EJS templating

MySQL (with connection pooling)

Express-session for session handling

Express-sanitizer for input sanitization

Request module for fetching weather data

CSS for styling tables and forms
