// utils/navigation.js
import { getElement } from './domUtils.js';

export const navigateToPage = (pageId) => {
	const pages = ['mainPage', 'registerPage', 'loginPage', 'sendUrlPage'];
	pages.forEach((page) => {
		if (page !== pageId) {
			getElement(page).classList.add('hidden'); // Hide all pages except the one specified
		} else {
			getElement(page).classList.remove('hidden'); // Show the specified page
		}
	});
};
