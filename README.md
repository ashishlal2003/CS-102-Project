Kindly download CS-102-Project-main folder from Google Drive, NodeJS, MongoDB Compass.

After completion, open the folder in a code editor (eg. Microsoft Visual Studio Code).
Then follow the given steps:

1. Open app.js and open up terminal at that location.

2. Set up npm using the following command:
	npm init -y

3. Set up the required npm packages by using the following command:
	npm i body-parser express ejs express-session mongoose passport passport-local-mongoose
	npm install -g nodemon

4. Open up a new terminal and type:
	mongod
   This starts up the Mongod server.

5. In the terminal opened up at the foldder location, type:
	nodemon app.js
   This starts up the web app server.

6. Access the locally hosted website at:
	localhost:3000

7. To set up an 'admin' user, signup the user as a Faculty, then go to MongoDB Compass, go to Users Collection and change the registered user's role to admin.

Following are the necessary links:
https://www.mongodb.com/try/download/compass
https://nodejs.org/en/download/

For any further clarifications, contact 21bcs011@iiitdwd.ac.in (Ankur De)
