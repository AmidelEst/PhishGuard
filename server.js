const express = require('express');
const app = express();
const session = require('express-session');
const uuid = require('uuid').v4; // Import the uuid module to generate UUIDs
require('dotenv').config();
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

// Use environment variables for PORT with a default
const PORT = process.env.PORT || 3001;

// MongoDB Connection
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log('MongoDB connected'))
	.catch((err) => console.error('MongoDB connection error:', err)); // Improved error handling

// Controllers
const userControllers = require('./src/controllers/user');
const urlControllers = require('./src/controllers/url');

// Session configuration
app.use(
	session({
		genid: (req) => {
			return uuid(); // Use UUIDs for session ID generation
		},
		secret: process.env.SESSION_SECRET, // Use an environmental variable for the secret
		resave: false,
		saveUninitialized: true,
		cookie: { secure: process.env.NODE_ENV === 'production' }, // Adjust based on environment
	})
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cors());
app.use(morgan('dev'));

// CORS and Security Headers
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	if (req.method === 'OPTIONS') {
		res.header(
			'Access-Control-Allow-Methods',
			'PUT, POST, PATCH, DELETE, GET'
		);
		return res.status(200).json({});
	}
	next();
});

// Routes
app.use('/user', userControllers);
app.use('/', urlControllers);

// Error Handling Middleware for Not Found
app.use((req, res, next) => {
	const error = new Error('Not Found');
	error.status = 404;
	next(error);
});

// Central Error Handling
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.json({
		error: {
			message: err.message || 'Internal Server Error',
		},
	});
});

// Server listening on port
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
