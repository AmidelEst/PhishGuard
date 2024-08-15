// src/middleware/roleMiddleware.js

const { verifyToken } = require('../utils/auth/authUtils');

const roleMiddleware = (roles) => {
	return (req, res, next) => {
		const token = req.headers.authorization?.split(' ')[1];
		if (!token)
			return res
				.status(401)
				.json({ success: false, message: 'Access Denied. No Token Provided.' });

		const user = verifyToken(token);
		if (!user) return res.status(403).json({ success: false, message: 'Invalid token.' });

		if (!roles.includes(user.role)) {
			return res
				.status(403)
				.json({ success: false, message: 'Access Denied. Insufficient Permissions.' });
		}

		req.user = user; // Pass the user object to the next middleware
		next(); // Proceed to the next middleware or route handler
	};
};

module.exports = roleMiddleware;
