import { navigateToPage } from './utils/navigation.js';
import { setupEventListeners } from './utils/eventListeners.js';
import { fetchAndPopulateWhitelistUrls } from './utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
	setupEventListeners();
		
	// Initial check for existing user session
	chrome.runtime.sendMessage({ message: 'onStart' }, (response) => {
		if (response.success) {
			navigateToPage('sendUrlPage');
			// Retrieve the subscribedWhitelistId from storage and fetch URLs
			chrome.storage.local.get('subscribedWhitelistId', (result) => {
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
});
	
