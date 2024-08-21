//------------------------------------------------------//
// extension/public/js/domHandlers/notification.js
import { getElement } from './getElement.js';

let notificationTimeout;

export const showNotification = (message, isSuccess, duration = 5000) => {
	const notification = getElement('notification');
	const notificationMessage = getElement('notification-message');
	const backdrop = getElement('backdrop');

	// Clear any existing timeout
	if (notificationTimeout) {
		clearTimeout(notificationTimeout);
	}

	// Ensure elements are found
	if (!notification || !notificationMessage || !backdrop) {
		console.error('Notification elements not found.');
		return;
	}

	// Set the message
	notificationMessage.innerText = message;

	// Show notification and backdrop
	notification.classList.remove('hidden');
	backdrop.classList.remove('hidden');

	// Remove both classes before adding the appropriate one
	notification.classList.remove('success', 'error');
	notification.classList.add(isSuccess ? 'success' : 'error');

	// Set a timeout to hide the notification
	notificationTimeout = setTimeout(() => {
		closeNotification();
	}, duration);
};

export const closeNotification = () => {
	const notification = getElement('notification');
	const backdrop = getElement('backdrop');

	// Ensure elements are found
	if (!notification || !backdrop) {
		console.error('Notification elements not found.');
		return;
	}

	// Hide notification and backdrop
	notification.classList.add('hidden');
	backdrop.classList.add('hidden');

	// Clear the timeout
	if (notificationTimeout) {
		clearTimeout(notificationTimeout);
	}
};

// Close notification when close button is clicked
getElement('close-notification-button').addEventListener('click', closeNotification);
