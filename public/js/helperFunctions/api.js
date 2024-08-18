//------------------------------------------------------//
// public/js/helperFunctions/api.js
import { showNotification } from '../domHandlers/notification.js';
import { populateAdminDropdown, populateWhitelistsDropdown, populateWhitelistUrls } from '../domHandlers/dropdown.js';

// Standard function to handle API requests
const sendMessageToBackground = message => {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(message, response => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError.message);
			} else if (!response.success) {
				reject(response.message || 'Unknown error occurred.');
			} else {
				resolve(response);
			}
		});
	});
};
// Register user
export const registerUser = (payload, callback) => {
	sendMessageToBackground({ message: 'register', payload })
		.then(response => {
			callback(response);
		})
		.catch(error => {
			console.error('Registration failed:', error);
			callback({ success: false, message: error });
		});
};
// Fetch and populate admins dropdown
export const fetchAndPopulateAdmins = () => {
	chrome.runtime.sendMessage({ message: 'fetchAdmins' }, response => {
		if (response.success) {
			populateAdminDropdown(response.admins);
		} else {
			showNotification('Failed to load admin list. Please try again later.', false);
		}
	});
};
// Fetch and populate admin's whitelists dropdown
export const fetchAndPopulateAdminsWhitelists = adminName => {
	chrome.runtime.sendMessage({ message: 'fetchAdminsWhitelists', adminName }, response => {
		if (response.success) {
			populateWhitelistsDropdown(response.whitelists);
		} else {
			showNotification('Failed to load whitelists. Please try again later.', false);
		}
	});
};
// Login user
export const loginUser = (email, password, callback) => {
	const payload = { email, password };
	sendMessageToBackground({ message: 'login', payload })
		.then(response => {
			callback(response);
		})
		.catch(error => {
			console.error('Login failed:', error);
			callback({ success: false, message: error });
		});
};
// Retrieves subscribedWhitelistId from chrome storage
export const fetchSubscribedWhitelistId = callback => {
	chrome.storage.local.get('subscribedWhitelistId', result => {
		if (result.subscribedWhitelistId) {
			callback(result.subscribedWhitelistId); // Pass the ID to the callback
		} else {
			console.error('No subscribedWhitelistId found in storage');
			callback(null); // Handle missing ID case
		}
	});
};
// Get user's subscribed whitelist from local storage
export const getUserSubscribedWhitelist = () => {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('subscribedWhitelist', result => {
			if (result.subscribedWhitelist) {
				resolve(result.subscribedWhitelist);
			} else {
				const errorMsg = 'Subscribed whitelist not found in storage';
				console.error(errorMsg);
				reject(errorMsg);
			}
		});
	});
};
// Fetch the subscribed whitelist URLs and populate them into the UI
export const fetchAndPopulateWhitelistUrls = subscribedWhitelistId => {
	console.log('🚀 ~ fetchAndPopulateWhitelistUrls ~ subscribedWhitelistId:', subscribedWhitelistId); // Debugging

	return sendMessageToBackground({
		message: 'fetchSubscribedWhitelist',
		subscribedWhitelistId: subscribedWhitelistId
	})
		.then(response => {
			const urls = response.monitoredSites || [];
			populateWhitelistUrls(urls); // Populate the URLs into the UI
			return urls;
		})
		.catch(error => {
			console.error('Failed to fetch monitored sites:', error);
			showNotification('Failed to fetch monitored sites.', false);
			return [];
		});
};
