// utils/eventListeners.js
import { getElement } from './domUtils.js';
import { navigateToPage } from './navigation.js';
import { validatePassword } from './validation.js';
import {
	loginUser,
	getSubscribedWhitelistId,
	fetchAndPopulateWhitelistUrls,
	fetchAdmins,
	fetchAdminsWhitelists,
} from './api.js';
import { showNotification, closeNotification } from './notification.js';

export const setupEventListeners = () => {
	// Close notification
	getElement('close-notification-button').addEventListener('click', closeNotification);

	// Admin selection
	getElement('adminDropdown').addEventListener('change', (e) => {
		const selectedAdminName = e.target.value;
		if (selectedAdminName) {
			fetchAdminsWhitelists(selectedAdminName);
		} else {
			console.error('Admin name is not defined.');
		}
	});

	// Navigation between pages
	getElement('goToLogin').addEventListener('click', () => navigateToPage('loginPage'));
	getElement('goToRegister').addEventListener('click', () => {
		navigateToPage('registerPage');
		fetchAdmins();
	});
	getElement('goBackBtnFromRegister').addEventListener('click', () =>
		navigateToPage('mainPage')
	);
	getElement('goBackBtnFromLogin').addEventListener('click', () =>
		navigateToPage('mainPage')
	);

	// Registration form
	const registerForm = getElement('registerForm');
	if (registerForm) {
		registerForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const email = getElement('registerEmail').value;
			const password = getElement('registerPassword').value;
			const confirmPassword = getElement('confirmPassword').value;
			const selectedWhitelist = getElement('whitelistDropdown').value;
			let isValid = true;

			if (password !== confirmPassword) {
				getElement('confirmPassword').setCustomValidity('Passwords do not match.');
				isValid = false;
			} else {
				getElement('confirmPassword').setCustomValidity('');
			}

			if (!selectedWhitelist) {
				getElement('whitelistDropdown').setCustomValidity('Invalid');
				isValid = false;
			}

			if (!isValid) {
				registerForm.classList.add('was-validated');
				return;
			}

			const payload = {
				email: email,
				password: password,
				subscribedWhitelist: selectedWhitelist,
			};

			chrome.runtime.sendMessage({ message: 'register', payload }, (response) => {
				if (response.success) navigateToPage('mainPage');
				showNotification(response.message, response.success);
			});
		});

		registerForm.addEventListener('input', (e) => {
			e.target.classList.toggle('is-invalid', !e.target.checkValidity());
		});

		getElement('registerPassword').addEventListener('input', validatePassword);
	}

	// Login form
	const loginForm = getElement('loginForm');
	if (loginForm) {
		loginForm.addEventListener('submit', (e) => {
			e.preventDefault();

			const email = getElement('loginEmail').value;
			const password = getElement('loginPassword').value;

			// Handle login process
			loginUser(email, password, (response) => {
				if (response.success) {
					navigateToPage('sendUrlPage');
					// Retrieve the subscribedWhitelistId and fetch the corresponding whitelist
					getSubscribedWhitelistId((subscribedWhitelistId) => {
						fetchAndPopulateWhitelistUrls(subscribedWhitelistId);
					});
				} else {
					showNotification(response.message, response.success);
				}
			});
		});
	}

	// Send URL form
	const sendUrlForm = getElement('sendUrlForm');
	if (sendUrlForm) {
		sendUrlForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const urlAddress = getElement('urlField').value;

			chrome.runtime.sendMessage(
				{ message: 'checkUrl', payload: { url: urlAddress } },
				(response) => {
					showNotification(response.message, response.success);
				}
			);
		});
	}

	// Logout
	const logOutBtn = getElement('logOutBtn');
	if (logOutBtn) {
		logOutBtn.addEventListener('click', () => {
			chrome.runtime.sendMessage({ message: 'logOut' }, (response) => {
				if (response.success) {
					navigateToPage('mainPage');
				} else {
					showNotification(response.message, response.success);
				}
			});
		});
	}
};
