//------------------------------------------------------//
//  public/js/helperFunctions/eventListeners.js
import { getElement } from '../domHandlers/getElement.js';
import { navigateToPage } from '../domHandlers/navigation.js';
import { validatePassword } from '../domHandlers/validation.js';
import {
	loginUser,
	fetchSubscribedWhitelistId,
	fetchAndPopulateWhitelistUrls,
	fetchAndPopulateAdmins,
	fetchAndPopulateAdminsWhitelists,
	getUserSubscribedWhitelist,
} from './api.js';
import { formatSubmittedUrl, isUrlInWhitelist } from './url.js';
import { showNotification, closeNotification } from '../domHandlers/notification.js';

export const setupEventListeners = () => {
	// Close notification
	getElement('close-notification-button').addEventListener('click', closeNotification);
	// Admin selection
	getElement('adminDropdown').addEventListener('change', (e) => {
		const selectedAdminName = e.target.value;
		if (selectedAdminName) {
			fetchAndPopulateAdminsWhitelists(selectedAdminName);
		} else {
			console.error('Admin name is not defined.');
		}
	});
	// Navigation between pages
	getElement('goToLogin').addEventListener('click', () => navigateToPage('loginPage'));
	getElement('goToRegister').addEventListener('click', () => {
		navigateToPage('registerPage');
		fetchAndPopulateAdmins();
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
					fetchSubscribedWhitelistId((subscribedWhitelistId) => {
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
		sendUrlForm.addEventListener('submit', async (e) => {
			e.preventDefault();

			// Get submitted URL
			const submittedURL = getElement('urlField').value.trim().toLowerCase();
			// Auto-assign the correct prefix if missing
			const formattedSubmittedURL = formatSubmittedUrl(submittedURL);
			try {
				// Get the user's subscribed whitelist URLs asynchronously
				const subscribedWhitelist = await getUserSubscribedWhitelist();
				const { success, canonicalUrl, message } = isUrlInWhitelist(
					formattedSubmittedURL,
					subscribedWhitelist
				);

				if (success) {
					showNotification('URL is in subscribed whitelist.', true);
					console.log(canonicalUrl);
					// Send URL for certificate check if it's in the whitelist
					chrome.runtime.sendMessage(
						{
							message: 'checkCertificate',
							payload: {
								whitelistUrl: canonicalUrl,
								submittedUrl: formattedSubmittedURL,
							},
						},
						(response) => {
							showNotification(response.message, response.success);
						}
					);
				} else {
					// URL is NOT in the whitelist
					showNotification(message, false);

					// Send URL for further processing
					chrome.runtime.sendMessage(
						{ message: 'checkUrl', payload: { url: formattedSubmittedURL } },
						(response) => {
							showNotification(response.message, response.success);
						}
					);
				}
			} catch (error) {
				console.error('Error checking URL against whitelist:', error);
				showNotification(error.message, false);
			}
		});
	}

	// Logout
	const logOutBtn = getElement('logOutBtn');
	if (logOutBtn) {
		logOutBtn.addEventListener('click', () => {
			chrome.runtime.sendMessage({ message: 'logout' }, (response) => {
				if (response.success) {
					navigateToPage('mainPage');
				} else {
					showNotification(response.message, response.success);
				}
			});
		});
	}
};
