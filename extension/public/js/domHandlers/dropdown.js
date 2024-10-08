
//------------------------------------------------------//
// public/js/domHandlers/dropdown.js
import { getElement } from './getElement.js';
import { extractBaseUrl } from '../helperFunctions/urlUtils.js';

// Helper function to clear and populate a dropdown
//dropdown element, array of items, key for value, key for text, text to display if no items are available.
const clearAndPopulateDropdown = (dropdown, items, valueKey, textKey, emptyText) => {
	dropdown.innerHTML = ''; // Clear existing options
	if (items && items.length > 0) {
		// Populate dropdown with new options
		items.forEach(item => {
			const option = document.createElement('option');
			option.value = item[valueKey];
			option.text = item[textKey];
			dropdown.appendChild(option);
		});
		dropdown.disabled = false;
	} else {
		// Handle empty dropdown case
		const noOptionsItem = document.createElement('option');
		noOptionsItem.value = '';
		noOptionsItem.text = emptyText;
		dropdown.appendChild(noOptionsItem);
		dropdown.disabled = true;
	}
};

// Populate admin dropdown on registration page
export const populateAdminDropdown = admins => {
	const adminDropdown = getElement('adminDropdown');
	clearAndPopulateDropdown(adminDropdown, admins, 'name', 'name', 'No admins available');
};

// Populate whitelist dropdown on registration page
export const populateWhitelistsDropdown = whitelists => {
	const whitelistDropdown = getElement('whitelistDropdown');
	clearAndPopulateDropdown(whitelistDropdown, whitelists, '_id', 'whitelistName', 'No whitelists available');
};

// Populate whitelist URLs after login
export const populateWhitelistUrls = urls => {
	const whitelistUrls = getElement('whitelistUrls');
	whitelistUrls.innerHTML = ''; // Clear existing URLs

	if (urls && urls.length > 0) {
		urls.forEach(url => {
			const listItem = document.createElement('li');
			listItem.classList.add('list-group-item');
			listItem.textContent = extractBaseUrl(url);
			whitelistUrls.appendChild(listItem);
		});
	} else {
		const noUrlsItem = document.createElement('li');
		noUrlsItem.classList.add('list-group-item');
		noUrlsItem.textContent = 'No URLs found in the whitelist.';
		whitelistUrls.appendChild(noUrlsItem);
	}
};
