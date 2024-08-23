//------------------------------------------------------//
//  extension/public/js/helperFunctions/eventListeners.js
import { getElement } from '../domHandlers/getElement.js';
import { navigateToPage } from '../domHandlers/navigation.js';
import {
	validateRegisterPassword,
	validateEmailField,
	validateUrlField,
	validateLoginPassword,
	validateRegisterEmailField
} from '../domHandlers/validation.js';
import {
	loginUser,
	logoutUser,
	registerUser,
	fetchSubscribedWhitelistId,
	fetchAndPopulateWhitelistUrls,
	fetchAndPopulateAdmins,
	fetchAndPopulateAdminsWhitelists,
	getUserSubscribedWhitelist,
	checkMinMash,
	checkCertificate,
	createNewQuery,
	newQuery
} from './api.js';
//formatSubmittedUrl , normalizeUrl
import { formatAndNormalizeUrl, isUrlInWhitelist } from './urlUtils.js';
import { showNotification, closeNotification } from '../domHandlers/notification.js';

//* Setup navigation for page interactions //!fetch and populate
const setupButtonsListeners = () => {
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
//!----------ALGORITHMS - PRIVATE---------//
//! Handles URL form submission and processing
const handleSendUrlFormSubmit = () => {
	const sendUrlForm = getElement('sendUrlForm');
	if (sendUrlForm) {
		sendUrlForm.addEventListener('submit', async e => {
			e.preventDefault();

			let submittedURL = getElement('urlField').value.trim().toLowerCase();
			const submittedURLCopy = submittedURL;
			console.log('52= ' + submittedURL);

			// Validate URL field
			const isUrlValid = validateUrlField();
			submittedURL = formatAndNormalizeUrl(submittedURL);
			console.log('formatAndNormalizeUrl: ' + submittedURL);

			// If URL is valid, proceed with form submission
			if (isUrlValid) {
				try {
					const subscribedWhitelist = await getUserSubscribedWhitelist();

					//^ Step 1: relevant to all levels : Check if URL is in the whitelist
					const { success, canonicalUrl } = isUrlInWhitelist(submittedURL, subscribedWhitelist);
					const isInSubscribedWhitelist = success;

					if (isInSubscribedWhitelist) {
						console.log(submittedURLCopy + ' Found in whitelist');
						showNotification('URL is in subscribed whitelist.', isInSubscribedWhitelist);
					} else {
						showNotification('URL is in NOT whitelist.', false);
						return;
					}
					//^ Step 2: relevant to all levels
					const isCvCheckSuccess = await checkCertificate(canonicalUrl, submittedURL);

					console.log('isCvCheckSuccess:', isCvCheckSuccess);
					if (!isCvCheckSuccess) {
						return;
					}
					//* createNewQuery //! accumulate results

					createNewQuery(canonicalUrl, submittedURLCopy, isInSubscribedWhitelist, isCvCheckSuccess);
					//! Step 3: only medium and high
					const checkMinHashResult = await checkMinMash(canonicalUrl);
					// let minHashScore = checkMinHashResult.similarity;
					// const minHashThreshold = 0.8;
					// let overAllScore = cvScore === 'Yes' && minHashScore !== null && minHashScore >= minHashThreshold ? 1 : 0;
					// newQuery(submittedURLCopy, isInSubscribedWhitelist, cvScore, minHashScore, overAllScore);
				} catch (error) {
					console.log('Error ' + error);
					showNotification(error.message, false);
				}
			}
		});
	}
};
// todo - LoginDynamic validation
const setupLoginDynamicValidation = () => {
	const loginForm = getElement('loginForm');
	if (!loginForm) return;

	// Validate the email field in real-time
	const emailField = getElement('loginEmail');
	emailField.addEventListener('input', () => {
		const isValid = validateEmailField('loginEmail'); // Assuming validateEmailField() is defined elsewhere
		emailField.classList.toggle('is-valid', isValid);
		emailField.classList.toggle('is-invalid', !isValid);
	});

	// Validate the password field in real-time
	const passwordField = getElement('loginPassword');
	passwordField.addEventListener('input', () => {
		const isPasswordValid = validateLoginPassword(); // Assuming validateLoginPassword() is defined elsewhere
		passwordField.classList.toggle('is-valid', isPasswordValid);
		passwordField.classList.toggle('is-invalid', !isPasswordValid);
	});
};

//? 1) Login Handles form submission and validation
const handleLoginFormSubmit = () => {
	const loginForm = getElement('loginForm');
	if (loginForm) {
		loginForm.addEventListener('submit', e => {
			e.preventDefault();

			// Retrieve form values
			const email = getElement('loginEmail').value;
			const password = getElement('loginPassword').value;

			// Perform field validations
			const isEmailValid = validateEmailField('loginEmail');
			const isPasswordValid = validateLoginPassword(); // Assuming custom validation logic

			// Trigger HTML5 form validation
			const isFormValid = loginForm.checkValidity();

			// If form is not valid, show feedback and prevent submission
			if (!isEmailValid || !isPasswordValid || !isFormValid) {
				loginForm.classList.add('was-validated');
				return;
			}

			//? Handle login process
			loginUser(email, password, response => {
				if (response.success) {
					navigateToPage('sendUrlPage');

					// Retrieve the subscribedWhitelistId + fetch the corresponding whitelist
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

// ?---------Token Assigning Process--------------//
//? 2) Handles logout action
export const handleLogout = () => {
	const logOutBtn = getElement('logOutBtn');
	if (logOutBtn) {
		logOutBtn.addEventListener('click', () => {
			//? Handle login process
			logoutUser(response => {
				if (response.success) {
					navigateToPage('mainPage');
				} else {
					showNotification(response.message, response.success);
				}
			});
		});
	}
};

//*----------RegisterPage - PUBLIC ----------------------
// todo - RegisterDynamic set up form validation
const setupRegisterDynamicValidation = () => {
	const registerForm = getElement('registerForm');
	if (!registerForm) return;

	// Validate the email field in real-time
	const emailField = getElement('registerEmail');
	emailField.addEventListener('input', () => {
		const isValid = emailField.checkValidity();
		emailField.classList.toggle('is-valid', isValid);
		emailField.classList.toggle('is-invalid', !isValid);
	});

	// Validate the password field in real-time
	const passwordField = getElement('registerPassword');
	passwordField.addEventListener('input', () => {
		const isPasswordValid = validateRegisterPassword(); // Custom validation logic
		passwordField.classList.toggle('is-valid', isPasswordValid);
		passwordField.classList.toggle('is-invalid', !isPasswordValid);
	});

	// Validate the confirm password field in real-time
	const confirmPasswordField = getElement('confirmPassword');
	confirmPasswordField.addEventListener('input', () => {
		const password = passwordField.value.trim();
		const confirmPassword = confirmPasswordField.value.trim();
		const isPasswordConfirmed = password === confirmPassword;

		confirmPasswordField.classList.toggle('is-valid', isPasswordConfirmed);
		confirmPasswordField.classList.toggle('is-invalid', !isPasswordConfirmed);
		confirmPasswordField.setCustomValidity(isPasswordConfirmed ? '' : 'Passwords do not match.');
	});

	// Validate dropdowns in real-time
	const whitelistDropdown = getElement('whitelistDropdown');
	whitelistDropdown.addEventListener('change', () => {
		const selectedValue = whitelistDropdown.value;
		if (selectedValue) {
			whitelistDropdown.classList.add('is-valid');
			whitelistDropdown.classList.remove('is-invalid');
		} else {
			whitelistDropdown.classList.add('is-invalid');
			whitelistDropdown.classList.remove('is-valid');
		}
	});

	// Admin selection handling
	const adminDropdown = getElement('adminDropdown');
	adminDropdown.addEventListener('change', e => {
		const selectedAdminName = e.target.value;
		if (selectedAdminName) {
			fetchAndPopulateAdminsWhitelists(selectedAdminName);
			adminDropdown.classList.add('is-valid');
			adminDropdown.classList.remove('is-invalid');
		} else {
			adminDropdown.classList.add('is-invalid');
			adminDropdown.classList.remove('is-valid');
			console.error('Admin name is not selected.');
		}
	});

	// Validate security level dropdown in real-time
	const securityLevelDropdown = getElement('levelDropdown');
	securityLevelDropdown.addEventListener('change', () => {
		const isValid = !!securityLevelDropdown.value;
		securityLevelDropdown.classList.toggle('is-valid', isValid);
		securityLevelDropdown.classList.toggle('is-invalid', !isValid);
	});
};

//* 0) Register Handles form submission and validation
const handleRegisterFormSubmit = () => {
	const registerForm = getElement('registerForm');
	if (registerForm) {
		registerForm.addEventListener('submit', e => {
			e.preventDefault();

			// Initialize form fields
			const emailField = getElement('registerEmail');
			const passwordField = getElement('registerPassword');
			const confirmPasswordField = getElement('confirmPassword');
			const whitelistDropdown = getElement('whitelistDropdown');
			const securityLevelDropdown = getElement('levelDropdown');

			// Perform field validations
			const isEmailValid = validateRegisterEmailField('registerEmail'); // Assuming custom validation logic
			const isPasswordValid = validateRegisterPassword(); // Assuming custom validation logic
			const password = passwordField.value.trim();
			const confirmPassword = confirmPasswordField.value.trim();

			// Validate that passwords match
			const isPasswordConfirmed = password === confirmPassword;
			confirmPasswordField.setCustomValidity(isPasswordConfirmed ? '' : 'Passwords do not match.');

			// Validate dropdowns
			const isWhitelistValid = !!whitelistDropdown.value;
			const isSecurityLevelValid = !!securityLevelDropdown.value;

			// Mark fields as validated dynamically
			passwordField.classList.toggle('is-valid', isPasswordValid);
			passwordField.classList.toggle('is-invalid', !isPasswordValid);
			confirmPasswordField.classList.toggle('is-valid', isPasswordConfirmed);
			confirmPasswordField.classList.toggle('is-invalid', !isPasswordConfirmed);
			whitelistDropdown.classList.toggle('is-valid', isWhitelistValid);
			whitelistDropdown.classList.toggle('is-invalid', !isWhitelistValid);
			securityLevelDropdown.classList.toggle('is-valid', isSecurityLevelValid);
			securityLevelDropdown.classList.toggle('is-invalid', !isSecurityLevelValid);

			// Trigger HTML5 form validation
			const isFormValid = registerForm.checkValidity();

			// If form is not valid, show feedback and prevent submission
			if (
				!isFormValid ||
				!isEmailValid ||
				!isPasswordValid ||
				!isPasswordConfirmed ||
				!isWhitelistValid ||
				!isSecurityLevelValid
			) {
				registerForm.classList.add('was-validated');
				return;
			}

			// Prepare registration payload
			const payload = {
				email: emailField.value,
				password,
				subscribedWhitelist: whitelistDropdown.value,
				securityLevel: securityLevelDropdown.value
			};

			// Send registration request
			registerUser(payload, response => {
				if (response.success) {
					navigateToPage('mainPage');
					// Reset the form fields after successful submission
					registerForm.reset(); // This resets all form fields
					registerForm.classList.remove('was-validated'); // Remove the validation class
				}
				showNotification(response.message, response.success);
			});
		});
	}
};

//* Initialize ALL event listeners
export const setupEventListeners = () => {
	setupButtonsListeners();
	setupRegisterDynamicValidation();
	setupLoginDynamicValidation();
	handleRegisterFormSubmit();
	handleLoginFormSubmit();
	handleSendUrlFormSubmit();
	handleLogout();
};
