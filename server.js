const express = require('express');
const app = express();
const session = require('express-session');
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

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));

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

// Error Middleware
app.use((req, res, next) => {
	const error = new Error('Not Found');
	error.status = 404;
	next(error);
});

// Session configuration
app.use(
	session({
		secret: 'your secret key', // Replace 'your secret key' with a real secret key
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true }, // Secure is recommended for HTTPS. Set to false if using HTTP.
	})
);

// Central error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// Server listening on port
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
