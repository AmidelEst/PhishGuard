//------------------------------------------------------//
// public/js/domHandlers/navigation.js
import { getElement } from './getElement.js';

// Navigates to the specified page, hiding all others
export const navigateToPage = pageId => {
	const pages = ['mainPage', 'registerPage', 'loginPage', 'sendUrlPage'];

	pages.forEach(page => {
		const pageElement = getElement(page);
		if (pageElement) {
			pageElement.classList.toggle('hidden', page !== pageId);
		}
	});
};
