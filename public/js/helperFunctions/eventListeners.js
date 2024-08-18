//------------------------------------------------------//
//  public/js/helperFunctions/eventListeners.js
import { getElement } from '../domHandlers/getElement.js';
import { navigateToPage } from '../domHandlers/navigation.js';
import { validatePassword, validateUrlField } from '../domHandlers/validation.js';
import {
	loginUser,
	registerUser,
	fetchSubscribedWhitelistId,
	fetchAndPopulateWhitelistUrls,
	fetchAndPopulateAdmins,
	fetchAndPopulateAdminsWhitelists,
	getUserSubscribedWhitelist
} from './api.js';
import { formatSubmittedUrl, isUrlInWhitelist } from '../helperFunctions/urlUtils.js';
import { showNotification, closeNotification } from '../domHandlers/notification.js';

// Setup navigation for page interactions //!fetch and populate
const setupNavigationListeners = () => {
	// Close notification
	getElement('close-notification-button').addEventListener('click', () => {
		closeNotification();
	});
	// Admin selection
	getElement('adminDropdown').addEventListener('change', e => {
		const selectedAdminName = e.target.value;
		if (selectedAdminName) {
			fetchAndPopulateAdminsWhitelists(selectedAdminName);
		} else {
			console.error('Admin name is not defined.');
		}
	});

	// Page navigation buttons
	getElement('goToLogin').addEventListener('click', () => navigateToPage('loginPage'));
	getElement('goToRegister').addEventListener('click', () => {
		navigateToPage('registerPage');
		fetchAndPopulateAdmins();
	});
	getElement('goBackBtnFromRegister').addEventListener('click', () => navigateToPage('mainPage'));
	getElement('goBackBtnFromLogin').addEventListener('click', () => navigateToPage('mainPage'));
};
// Helper function to set up form validation
const setupFormValidation = (form, validators) => {
	form.addEventListener('input', e => {
		e.target.classList.toggle('is-invalid', !e.target.checkValidity());
	});
	validators.forEach(validator => validator());
};
// Handles registration form submission and validation
const handleRegisterFormSubmit = () => {
	const registerForm = getElement('registerForm');
	if (registerForm) {
		registerForm.addEventListener('submit', e => {
			e.preventDefault();

			const email = getElement('registerEmail').value;
			const password = getElement('registerPassword').value;
			const confirmPassword = getElement('confirmPassword').value;
			const selectedWhitelist = getElement('whitelistDropdown').value;

			// Custom validations
			let isValid = password === confirmPassword && selectedWhitelist;

			// Set custom validity messages
			getElement('confirmPassword').setCustomValidity(password !== confirmPassword ? 'Passwords do not match.' : '');
			getElement('whitelistDropdown').setCustomValidity(!selectedWhitelist ? 'Please select a whitelist.' : '');

			if (!isValid) {
				registerForm.classList.add('was-validated');
				return;
			}

			// Prepare registration payload
			const payload = {
				email: email,
				password: password,
				subscribedWhitelist: selectedWhitelist
			};

			// Send registration request
			registerUser(payload, response => {
				if (response.success) {
					navigateToPage('mainPage');
				}
				showNotification(response.message, response.success);
			});
		});

		// Set up form validation and password validation logic
		setupFormValidation(registerForm, [
			() => getElement('registerPassword').addEventListener('input', validatePassword)
		]);
	}
};
// Handles login form submission and validation
const handleLoginFormSubmit = () => {
	const loginForm = getElement('loginForm');
	if (loginForm) {
		loginForm.addEventListener('submit', e => {
			e.preventDefault();

			const email = getElement('loginEmail').value;
			const password = getElement('loginPassword').value;

			// Handle login process
			loginUser(email, password, response => {
				if (response.success) {
					navigateToPage('sendUrlPage');
					// Retrieve the subscribedWhitelistId and fetch the corresponding whitelist
					fetchSubscribedWhitelistId(subscribedWhitelistId => {
						if (subscribedWhitelistId) {
							console.log('🚀 ~ handleLoginFormSubmit ~ subscribedWhitelistId:', subscribedWhitelistId);
							fetchAndPopulateWhitelistUrls(subscribedWhitelistId); // Populate the URLs
						} else {
							showNotification('No subscribed whitelist found', false);
						}
					});
				} else {
					showNotification(response.message, response.success);
				}
			});
		});
	}
};
// Handles URL form submission and processing
const handleSendUrlFormSubmit = () => {
	const sendUrlForm = getElement('sendUrlForm');
	if (sendUrlForm) {
		sendUrlForm.addEventListener('submit', async e => {
			e.preventDefault();

			const submittedURL = getElement('urlField').value.trim().toLowerCase();
			const formattedSubmittedURL = formatSubmittedUrl(submittedURL);

			// Validate URL field
			const isUrlValid = validateUrlField();
			// If URL is valid, proceed with form submission
			if (isUrlValid) {
				try {
					const subscribedWhitelist = await getUserSubscribedWhitelist();
					const { success, canonicalUrl, message } = isUrlInWhitelist(formattedSubmittedURL, subscribedWhitelist);

					if (success) {
						showNotification('URL is in subscribed whitelist.', true);
						// Send URL for certificate check if it's in the whitelist
						chrome.runtime.sendMessage(
							{
								message: 'checkCertificate',
								payload: { whitelistUrl: canonicalUrl, submittedUrl: formattedSubmittedURL }
							},
							response => {
								showNotification(response.message, response.success);
							}
						);
					} else {
						showNotification(message, false);
						// Send URL for further processing
						chrome.runtime.sendMessage({ message: 'checkUrl', payload: { url: formattedSubmittedURL } }, response => {
							showNotification(response.message, response.success);
						});
					}
				} catch (error) {
					console.error('Error checking URL against whitelist:', error);
					showNotification(error.message, false);
				}
			}
		});
	}
};
// Handles logout action
const handleLogout = () => {
	const logOutBtn = getElement('logOutBtn');
	if (logOutBtn) {
		logOutBtn.addEventListener('click', () => {
			chrome.runtime.sendMessage({ message: 'logout' }, response => {
				if (response.success) {
					navigateToPage('mainPage');
				}
				showNotification(response.message, response.success);
			});
		});
	}
};
// Main setup function to initialize all event listeners
export const setupEventListeners = () => {
	setupNavigationListeners();
	handleRegisterFormSubmit();
	handleLoginFormSubmit();
	handleSendUrlFormSubmit();
	handleLogout();
};
