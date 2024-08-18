// public/js/helperFunctions/sessionManager.js

import { navigateToPage } from '../domHandlers/navigation.js';
import { fetchAndPopulateWhitelistUrls } from './api.js';
import { showNotification } from '../domHandlers/notification.js';

export const checkUserSessionAndNavigate = () => {
	// Check if the user has an active session by communicating with the background script
	chrome.runtime.sendMessage({ message: 'onStart' }, response => {
		if (response.success) {
			navigateToPage('sendUrlPage');
			// Retrieve the subscribedWhitelistId from local storage
			chrome.storage.local.get('subscribedWhitelistId', result => {
				if (result.subscribedWhitelistId) {
					// Fetch and populate the whitelist URLs
					fetchAndPopulateWhitelistUrls(result.subscribedWhitelistId);
				} else {
					console.error('subscribedWhitelistId not found in storage');
					showNotification('Could not retrieve whitelist. Please try again.', false);
				}
			});
		} else {
			navigateToPage('mainPage');
		}
	});
};
