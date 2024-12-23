//------------------------------------------//
// server.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const redisClient = require('./src/features/users/utils/auth/redisClient');
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
	// Security Middleware
	app.use(helmet()); // Sets various HTTP headers to help protect

	// Middleware
	// CORS Middleware
	app.use(
		cors({
			origin: '*', // Allow all origins; change to your frontend URL in production
			methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			preflightContinue: false,
			optionsSuccessStatus: 204 // For legacy browsers support
		})
	);
	app.options('*', cors()); // Enable pre-flight request handling for all routes
	app.use(express.json());
	app.use(express.static('public'));
	app.use(morgan('dev'));
	app.use(express.urlencoded({ extended: true }));

	// Import Controllers
	const adminUserControllers = require('./src/features/users/controllers/adminUser');
	const regularUserControllers = require('./src/features/users/controllers/regularUser');
	const sitesControllers = require('./src/features/sites/controllers/sites');

	// Setup whitelist
	// const setupWhitelist = require('./src/utils/whitelist');
	// setupWhitelist();

	// Routes
	app.use('/admin', adminUserControllers);
	app.use('/user', regularUserControllers);
	app.use('/sites', sitesControllers);

	// Error Handling Middleware for Not Found
	app.use((req, res, next) => {
		const error = new Error('Not Found');
		error.status = 404;
		next(error);
	});

	// Central Error Handling
	app.use((err, req, res, next) => {
		res.status(err.status || 500).json({
			error: { message: err.message || 'Internal Server Error' }
		});
	});

	// Graceful shutdown
	process.on('SIGTERM', () => {
		console.log('SIGTERM signal received: closing HTTP server');
		server.close(() => {
			console.log('HTTP server closed');
			mongoose.connection.close(false, () => {
				console.log('MongoDB connection closed');
				process.exit(0);
			});
		});
	});

	// Server listening on port
	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
}

// Connect to MongoDB and start the server
connectToMongoDB();
