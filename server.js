// server.js

//requires
const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const PORT = 3001;
//----

// Db
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('connected', () => {
	console.log('MongoDB connected');
});
//------
// Controllers
const userControllers = require('./src/controllers/user');
const urlControllers = require('./src/controllers/url');
//----

// Basic middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(morgan('dev'));
app.use(
	express.urlencoded({
		extended: false,
	})
);
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

app.use((req, res, next) => {
	const error = new Error('Not Found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message,
		},
	});
});

// Central error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// Server listening on port
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
