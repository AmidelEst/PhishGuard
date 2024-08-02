const express = require('express');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

// MongoDB Connection
async function connectToMongoDB() {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('MongoDB connected');
		startServer(); // Start the server after successful MongoDB connection
	} catch (err) {
		console.error('MongoDB connection error:', err);
		process.exit(1); // Exit the process with failure
	}
}
function startServer() {
	// Session configuration
	app.use(
		session({
			genid: () => uuidv4(),
			secret: process.env.SESSION_SECRET,
			resave: false,
			saveUninitialized: true,
			cookie: { secure: process.env.NODE_ENV === 'production' },
		})
	);

	// Middleware
	app.use(express.json());
	app.use(express.static('public'));
	app.use(cors({ origin: process.env.API_URL }));
	app.use(morgan('dev'));

	// Import Controllers
	const userControllers = require('./src/controllers/user');
	const urlControllers = require('./src/controllers/url');

	// Setup whitelist URLs
	const setupWhitelist = require('./src/utils/whitelist');
	setupWhitelist(); // Call the function to setup the whitelist

	// Routes
	app.use('/user', userControllers);
	app.use('/url', urlControllers);

	// Error Handling Middleware for Not Found
	app.use((req, res, next) => {
		const error = new Error('Not Found');
		error.status = 404;
		next(error);
	});

	// Central Error Handling
	app.use((err, req, res, next) => {
		res.status(err.status || 500).json({
			error: {
				message: err.message || 'Internal Server Error',
			},
		});
	});

	// Server listening on port
	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
}

// Connect to MongoDB and start the server
connectToMongoDB();