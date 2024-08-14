// utils/api.js
import { showNotification } from './notification.js';
import {
	populateAdminDropdown,
	populateWhitelistsDropdown,
	populateWhitelistUrls,
} from './dropdown.js';

//at registerPage-GET admins
export const fetchAdmins = () => {
	chrome.runtime.sendMessage({ message: 'fetchAdmins' }, (response) => {
		if (response.success) {
			populateAdminDropdown(response.admins);
		} else {
			showNotification('Failed to load admin list. Please try again later.', false);
		}
	});
};
//at registerPage-GET admin's Whitelists
export const fetchAdminsWhitelists = (selectedAdminName) => {
	chrome.runtime.sendMessage(
		{ message: 'fetchAdminsWhitelists', adminName: selectedAdminName },
		(response) => {
			if (response.success) {
				populateWhitelistsDropdown(response.whitelists);
			} else {
				showNotification('Failed to load whitelists. Please try again later.', false);
			}
		}
	);
};

// Function to handle the login process
export const loginUser = (email, password, callback) => {
    const payload = { email, password };
    chrome.runtime.sendMessage({ message: 'login', payload }, (response) => {
        callback(response);
    });
};

// Function to retrieve the subscribedWhitelistId from storage
export const getSubscribedWhitelistId = (callback) => {
    chrome.storage.local.get('subscribedWhitelistId', (result) => {
        if (result.subscribedWhitelistId) {
            callback(result.subscribedWhitelistId);
        } else {
            console.error('subscribedWhitelistId not found in storage');
            showNotification('Could not retrieve whitelist. Please try again.', false);
        }
    });
};
// Function to fetch the subscribed whitelist and populate the URLs
export const fetchAndPopulateWhitelistUrls = (subscribedWhitelistId) => {
    chrome.runtime.sendMessage(
		{ message: 'fetchSubscribedWhitelist', subscribedWhitelistId },
		(response) => {
			console.log('fetchSubscribedWhitelist response:', response); // Log the entire response
			if (response.success) {
				console.log('pulateWhitelistUrls:', response.monitoredSites);
				populateWhitelistUrls(response.monitoredSites); // Populate the list
			} else {
				showNotification('Failed to fetch monitored sites.', false);
			}
		}
	);
};
