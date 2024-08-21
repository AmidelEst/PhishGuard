//------------------------------------------------------//
//  extension/public/js/helperFunctions/eventListeners.js
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
	getUserSubscribedWhitelist,
	checkCertificate
} from './api.js';
import { formatSubmittedUrl, isUrlInWhitelist } from './urlUtils.js';
import { showNotification, closeNotification } from '../domHandlers/notification.js';

// Setup navigation for page interactions //!fetch and populate
const setupNavigationListeners = () => {
	// Close notification
	getElement('close-notification-button').addEventListener('click', () => {
		closeNotification();
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
const setupDynamicValidation = () => {
	const registerForm = document.getElementById('registerForm');

	if (!registerForm) return;

	// Validate the email field in real-time
	const emailField = document.getElementById('registerEmail');
	emailField.addEventListener('input', () => {
		const isValid = emailField.checkValidity();
		emailField.classList.toggle('is-valid', isValid);
		emailField.classList.toggle('is-invalid', !isValid);
	});

	// Validate the password field in real-time
	const passwordField = document.getElementById('registerPassword');
	passwordField.addEventListener('input', () => {
		const isPasswordValid = validatePassword(); // Custom validation logic
		passwordField.classList.toggle('is-valid', isPasswordValid);
		passwordField.classList.toggle('is-invalid', !isPasswordValid);
	});

	// Validate the confirm password field in real-time
	const confirmPasswordField = document.getElementById('confirmPassword');
	confirmPasswordField.addEventListener('input', () => {
		const password = passwordField.value.trim();
		const confirmPassword = confirmPasswordField.value.trim();
		const isPasswordConfirmed = password === confirmPassword;

		confirmPasswordField.classList.toggle('is-valid', isPasswordConfirmed);
		confirmPasswordField.classList.toggle('is-invalid', !isPasswordConfirmed);
		confirmPasswordField.setCustomValidity(isPasswordConfirmed ? '' : 'Passwords do not match.');
	});

	// Validate dropdowns in real-time
	const whitelistDropdown = document.getElementById('whitelistDropdown');
	whitelistDropdown.addEventListener('change', () => {
		const isValid = !!whitelistDropdown.value;
		whitelistDropdown.classList.toggle('is-valid', isValid);
		whitelistDropdown.classList.toggle('is-invalid', !isValid);
	});

	const securityLevelDropdown = document.getElementById('levelDropdown');
	securityLevelDropdown.addEventListener('change', () => {
		const isValid = !!securityLevelDropdown.value;
		securityLevelDropdown.classList.toggle('is-valid', isValid);
		securityLevelDropdown.classList.toggle('is-invalid', !isValid);
	});
};

const handleRegisterFormSubmit = () => {
	const registerForm = document.getElementById('registerForm');

	if (registerForm) {
		registerForm.addEventListener('submit', e => {
			e.preventDefault();

			// Initialize form fields
			const emailField = document.getElementById('registerEmail');
			const passwordField = document.getElementById('registerPassword');
			const confirmPasswordField = document.getElementById('confirmPassword');
			const whitelistDropdown = document.getElementById('whitelistDropdown');
			const securityLevelDropdown = document.getElementById('levelDropdown');

			// Perform field validations
			const isEmailValid = emailField.checkValidity();
			const isPasswordValid = validatePassword(); // Assuming validatePassword() is defined elsewhere
			const password = passwordField.value.trim();
			const confirmPassword = confirmPasswordField.value.trim();

			// Validate that passwords match
			const isPasswordConfirmed = password === confirmPassword;
			confirmPasswordField.setCustomValidity(isPasswordConfirmed ? '' : 'Passwords do not match.');

			// Validate dropdowns
			const isWhitelistValid = !!whitelistDropdown.value;
			const isSecurityLevelValid = !!securityLevelDropdown.value;

			// Mark fields as validated dynamically
			if (isPasswordValid && isPasswordConfirmed) {
				passwordField.classList.add('was-validated');
				confirmPasswordField.classList.add('was-validated');
			}

			// Trigger HTML5 form validation
			const isFormValid = registerForm.checkValidity();

			// If form is not valid, show feedback and prevent submission
			if (!isFormValid || !isEmailValid || !isPasswordValid || !isPasswordConfirmed) {
				registerForm.classList.add('was-validated');
				return;
			}
			// Admin selection
			getElement('adminDropdown').addEventListener('change', e => {
				const selectedAdminName = e.target.value;
				if (selectedAdminName) {
					fetchAndPopulateAdminsWhitelists(selectedAdminName);
				} else {
					console.error('Admin name is not defined.');
				}
			});

			// Prepare registration payload
			const payload = {
				email: emailField.value.trim(),
				password,
				subscribedWhitelist: whitelistDropdown.value,
				securityLevel: securityLevelDropdown.value
			};

			// Send registration request
			registerUser(payload, response => {
				if (response.success) {
					navigateToPage('mainPage');
				}
				showNotification(response.message, response.success);
			});
		});
	}
};

// Initialize dynamic validation
setupDynamicValidation();
handleRegisterFormSubmit();

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
//^----------WITH TOKEN ACTIONS - PRIVATE--------------------
// Handles URL form submission and processing
const handleSendUrlFormSubmit = () => {
	const sendUrlForm = getElement('sendUrlForm');
	if (sendUrlForm) {
		sendUrlForm.addEventListener('submit', async e => {
			e.preventDefault();

			const submittedURL = getElement('urlField').value.trim().toLowerCase();
			// Validate URL field
			const isUrlValid = validateUrlField();

			// If URL is valid, proceed with form submission
			if (isUrlValid) {
				try {
					const formattedSubmittedURL = formatSubmittedUrl(submittedURL);
					const subscribedWhitelist = await getUserSubscribedWhitelist();

					// Step 1: Check if URL is in the whitelist
					const { success, canonicalUrl } = isUrlInWhitelist(formattedSubmittedURL, subscribedWhitelist);

					if (success) {
						showNotification('URL is in subscribed whitelist.', success);
						// Step 2:
						checkCertificate(canonicalUrl, formattedSubmittedURL);
					} else {
						// Send URL for further processing
						chrome.runtime.sendMessage({ message: 'checkUrl', payload: { url: formattedSubmittedURL } }, response => {
							showNotification(response.message, response.success);
						});
					}
				} catch (error) {
					console.log('Error checking URL against whitelist:', error);
					showNotification(error.message, false);
				}
			}
		});
	}
};
// Handles logout action
export const handleLogout = () => {
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
//-------------------------
// Main setup function to initialize all event listeners
export const setupEventListeners = () => {
	setupNavigationListeners();
	handleRegisterFormSubmit();
	handleLoginFormSubmit();
	handleSendUrlFormSubmit();
	handleLogout();
};
