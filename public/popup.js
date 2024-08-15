// public/popup.js
import { navigateToPage } from './js/domHandlers/navigation.js';
import { setupEventListeners } from './js/helperFunctions/eventListeners.js';
import { fetchAndPopulateWhitelistUrls } from './js/helperFunctions/api.js';

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
	
