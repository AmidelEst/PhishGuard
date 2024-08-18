//------------------------------------------------------//
// src/features/users/middleware/roleMiddleware.js

const { verifyToken } = require('../utils/auth/authUtils');

const roleMiddleware = (roles) => {
	return async (req, res, next) => {
		try {
			const token = req.headers.authorization?.split(' ')[1];
			if (!token) {
				return res
					.status(401)
					.json({ success: false, message: 'Access Denied. No Token Provided.' });
			}

			// Await the token verification (handle async)
			const user = await verifyToken(token);

			// Ensure the user exists and has a valid role
			if (!user || !roles.includes(user.role)) {
				return res.status(403).json({
					success: false,
					message: 'Access Denied. Insufficient Permissions.',
				});
			}

			req.user = user; // Attach the user object to the request
			next(); // Proceed to the next middleware
		} catch (error) {
			// Handle token errors (blacklisted, expired, etc.)
			res.status(403).json({ success: false, message: error.message });
		}
	};
};

module.exports = roleMiddleware;
