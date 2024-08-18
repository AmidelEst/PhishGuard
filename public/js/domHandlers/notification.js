// //------------------------------------------------------//
// // public/js/domHandlers/notification.js
// import { getElement } from './getElement.js';
// export const showNotification = (message, isSuccess) => {
// 	const notification = getElement('notification');
// 	const notificationMessage = getElement('notification-message');
// 	const backdrop = getElement('backdrop');

// 	notificationMessage.innerText = message;
// 	notification.classList.remove('hidden', 'success', 'error');
// 	backdrop.classList.remove('hidden');

// 	notification.classList.add(isSuccess ? 'success' : 'error');
// };

// export const closeNotification = () => {
// 	const notification = getElement('notification');
// 	const backdrop = getElement('backdrop');

// 	notification.classList.add('hidden');
// 	backdrop.classList.add('hidden');
// };

//------------------------------------------------------//
// public/js/domHandlers/notification.js
import { getElement } from './getElement.js';

// Function to show the notification
export const showNotification = (message, isSuccess) => {
	const notification = getElement('notification');
	const notificationMessage = document.getElementById('notification-message');
	const backdrop = document.getElementById('backdrop');

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

	// Add success or error class based on the type of notification
	notification.classList.add(isSuccess ? 'success' : 'error');
};

// Function to close the notification
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
};

// Close notification when close button is clicked
getElement('close-notification-button').addEventListener('click', () => {
	closeNotification();
});
