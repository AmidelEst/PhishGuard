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
	extractBaseUrl,
} from './api.js';
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
			// get submitted URL
			let urlAddress = getElement('urlField').value.trim();
			// Get the user's subscribed whitelist URLs asynchronously
			try {
				const subscribedWhitelist = await getUserSubscribedWhitelist();

				// Extract and log the base URLs from the whitelist
				const subscribedWhitelistBaseUrls = subscribedWhitelist
					.map(extractBaseUrl)
					.filter(Boolean);

				// Check if the base URL exactly matches any whitelist URL
				const isInWhitelist = subscribedWhitelistBaseUrls.some(
					(whitelistUrl) => whitelistUrl === urlAddress
				);

				// If the URL is NOT in the whitelist, show a notification and stop further processing
				if (!isInWhitelist) {
					showNotification('URL is not in your subscribed whitelist.', false);
					return;
				}
				// Fetch and compare SSL certificates
				const sslCert = await fetchSSLCertificate(baseUrl);
				const isCertValid = await compareCertificates(baseUrl, sslCert);

				if (!isCertValid) {
					showNotification(
						'SSL certificate does not match the stored certificate.',
						false
					);
					return;
				}

				// ONLY When we are sending the URL to our server its important to add the safety mechanism
				if (!urlAddress.startsWith('http://') && !urlAddress.startsWith('https://')) {
					urlAddress = `https://${urlAddress}`;
				}

				// If URL IS in the whitelist, proceed with sending it for further processing
				chrome.runtime.sendMessage(
					{ message: 'checkUrl', payload: { url: urlAddress } },
					(response) => {
						showNotification(response.message, response.success);
					}
				);
			} catch (error) {
				console.error('Error checking URL against whitelist:', error);
				showNotification(
					'There was an error processing your request. Please try again.',
					false
				);
			}
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
