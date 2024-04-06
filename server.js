const express = require('express');
const app = express();
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

<<<<<<< HEAD
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
=======
const userRoutes = require('./src/controllers/user.js');
const adminRoutes = require('./src/controllers/admin.js');
>>>>>>> check1

// Routes
app.use('/user', userControllers);
app.use('/', urlControllers);

// Error Middleware
app.use((req, res, next) => {
	const error = new Error('Not Found');
	error.status = 404;
	next(error);
});

<<<<<<< HEAD
app.use((error, req, res, next) => {
	res.status(error.status || 500).json({
		error: {
			message: error.message,
		},
	});
=======
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

// Central error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
>>>>>>> check1
});

// Server listening on port
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
