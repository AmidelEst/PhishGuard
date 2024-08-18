//------------------------------------------------------//
// public/js/domHandlers/dropdown.js
import { getElement } from './getElement.js';
//at registerPage-populat admins
export const populateAdminDropdown = (admins) => {
	const adminDropdown = getElement('adminDropdown');
	adminDropdown.innerHTML = ''; // Clear existing options

	admins.forEach((admin) => {
		const option = document.createElement('option');
		option.value = admin.name; // Assuming name is used as the value
		option.text = admin.name;
		adminDropdown.appendChild(option);
	});
};
//at registerPage-populat admin's Whitelists
export const populateWhitelistsDropdown = (whitelists) => {
	const whitelistDropdown = getElement('whitelistDropdown');
	whitelistDropdown.innerHTML = ''; // Clear existing options
	if (whitelists && whitelists.length > 0) {
		whitelists.forEach((whitelist) => {
			const option = document.createElement('option');
			option.value = whitelist._id;
			option.text = whitelist.whitelistName;
			whitelistDropdown.appendChild(option);
		});
		whitelistDropdown.disabled = false;
	} else {
		const noWhitelistOption = document.createElement('option');
		noWhitelistOption.value = '';
		noWhitelistOption.text = 'No whitelists available';
		whitelistDropdown.appendChild(noWhitelistOption);
		whitelistDropdown.disabled = true;
	}
};
//after loginPage-populat subscribed whitelist's urls
export const populateWhitelistUrls = (urls) => {
	const whitelistUrls = getElement('whitelistUrls');
	whitelistUrls.innerHTML = ''; // Clear existing URLs

	if (urls && urls.length > 0) {
		urls.forEach((url) => {
			const listItem = document.createElement('li');
			listItem.classList.add('list-group-item');
			listItem.textContent = url;
			whitelistUrls.appendChild(listItem);
		});
	} else {
		const noUrlsItem = document.createElement('li');
		noUrlsItem.classList.add('list-group-item');
		noUrlsItem.textContent = 'No URLs found in the whitelist.';
		whitelistUrls.appendChild(noUrlsItem);
	}
};
