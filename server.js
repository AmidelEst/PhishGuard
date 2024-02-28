// server.js
//requires
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Basic middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(cors());

// DB and routes import
const { run } = require('./src/config/db');
const userRoutes = require('./src/controllers/userController.js');
const adminRoutes = require('./src/controllers/adminController.js');

// Controllers binding
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

//session manger
const session = require('express-session');

app.use(
	session({
		secret: 'your_secret_key',
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true, maxAge: 60000 },
	})
);
mongoose.connect(process.env.MONGO_URI);
// Connect to MongoDB
run().catch(console.dir);

// Central error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// Server listening on port
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
