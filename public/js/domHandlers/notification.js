// public/js/domHandlers/notification.js
import { getElement } from './getElement.js';

export const showNotification = (message, isSuccess) => {
	const notification = getElement('notification');
	const notificationMessage = getElement('notification-message');
	const backdrop = getElement('backdrop');

	notificationMessage.innerText = message;
	notification.classList.remove('hidden', 'success', 'error');
	backdrop.classList.remove('hidden');

	notification.classList.add(isSuccess ? 'success' : 'error');
};

export const closeNotification = () => {
	const notification = getElement('notification');
	const backdrop = getElement('backdrop');

	notification.classList.add('hidden');
	backdrop.classList.add('hidden');
};
