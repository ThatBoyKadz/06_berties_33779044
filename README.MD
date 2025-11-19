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
