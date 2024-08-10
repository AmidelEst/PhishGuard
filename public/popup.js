// /public/popup.js

(function () {
	// ----------- Utility Functions ------------------//

	const getElement = (id) => document.getElementById(id);

	// Show notification
	const showNotification = (message, success) => {
		const notification = getElement('notification');
		const notificationMessage = getElement('notification-message');
		const backdrop = getElement('backdrop');

		notificationMessage.innerText = message;
		notification.classList.remove('hidden', 'success', 'error');
		backdrop.classList.remove('hidden');

		notification.classList.add(success ? 'success' : 'error');
		notification.style.display = 'block';
		backdrop.style.display = 'block';
	};

	// Close notification
	const closeNotification = () => {
		const notification = getElement('notification');
		const backdrop = getElement('backdrop');

		notification.classList.add('hidden');
		backdrop.classList.add('hidden');
	};

	// Navigation between pages
	const goToMainPage = () => navigateToPage('mainPage');
	const goToSendUrlPage = () => navigateToPage('sendUrlPage');

	// Hide/Display mechanism
	const navigateToPage = (pageId) => {
		const pages = ['mainPage', 'registerPage', 'loginPage', 'sendUrlPage'];
		pages.forEach((page) => getElement(page).classList.add('hidden'));
		getElement(pageId).classList.remove('hidden');
	};

	// Hide all password validation feedback
	const hideAllFeedback = () => {
		const feedbackIds = [
			'passwordLengthFeedback',
			'passwordLetterNumberFeedback',
			'passwordSpecialCharFeedback',
			'passwordNoSpaceEmojiFeedback',
		];
		feedbackIds.forEach((id) => (getElement(id).style.display = 'none'));
	};

	// Validate password with custom feedback
	const validatePassword = () => {
		const password = getElement('registerPassword').value;
		hideAllFeedback();

		if (password.length < 8 || password.length > 20) {
			getElement('passwordLengthFeedback').style.display = 'block';
		} else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
			getElement('passwordLetterNumberFeedback').style.display = 'block';
		} else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			getElement('passwordSpecialCharFeedback').style.display = 'block';
		} else if (/\s/.test(password) || /[\uD800-\uDFFF]/.test(password)) {
			getElement('passwordNoSpaceEmojiFeedback').style.display = 'block';
		}
	};

	// Populate admin dropdown
	const populateAdminDropdown = (admins) => {
		const adminDropdown = getElement('adminDropdown');
		adminDropdown.innerHTML = ''; // Clear existing options

		admins.forEach((admin) => {
			const option = document.createElement('option');
			option.value = admin._id;
			option.text = admin.email;
			adminDropdown.appendChild(option);
		});
	};

	// Fetch admin list
	const fetchAdminList = () => {
		chrome.runtime.sendMessage({ message: 'fetchAdminList' }, function (response) {
			if (response.success) {
				populateAdminDropdown(response.admins);
			} else {
				showNotification('Failed to load admin list. Please try again later.', false);
			}
		});
	};

	// ----------- Event Listeners ------------------//

	// Add event listeners on document load
	document.addEventListener('DOMContentLoaded', () => {
		// Close notification event
		getElement('close-notification-button').addEventListener('click', closeNotification);

		// Navigation button events
		getElement('goToRegister').addEventListener('click', () => {
			goToMainPage();
			navigateToPage('registerPage');
			fetchAdminList();
		});

		getElement('goToLogin').addEventListener('click', () => navigateToPage('loginPage'));
		getElement('goBackBtnFromRegister').addEventListener('click', goToMainPage);
		getElement('goBackBtnFromLogin').addEventListener('click', goToMainPage);

		// Registration form submit event
		const registerForm = getElement('registerForm');
		if (registerForm) {
			registerForm.addEventListener('submit', (e) => {
				e.preventDefault();
				const email = document.getElementById('registerEmail').value;
				const password = getElement('registerPassword').value;
				const confirmPassword = getElement('confirmPassword').value;
				const selectedAdmin = getElement('adminDropdown').value;
				let isValid = true;

				// Reset custom validity messages and hide all feedback
				registerPassword.setCustomValidity('');
				hideAllFeedback();
				/// Validate password
				// validatePassword();

				if (password !== confirmPassword) {
					getElement('confirmPassword').setCustomValidity('Passwords do not match.');
					isValid = false;
				} else {
					getElement('confirmPassword').setCustomValidity('');
				}

				if (!selectedAdmin) {
					getElement('adminDropdown').setCustomValidity('Invalid');
					isValid = false;
				}

				if (!isValid) {
					registerForm.classList.add('was-validated');
					return;
				}

				// Send registration request
				const payload = {
					email: getElement('registerEmail').value,
					password: registerPassword.value,
					subscribedAdmin: selectedAdmin,
				};

				chrome.runtime.sendMessage({ message: 'register', payload }, (response) => {
					if (response.success) goToMainPage();
					showNotification(response.message, response.success);
				});
			});

			// Validation for input fields
			registerForm.addEventListener('input', function (e) {
				e.target.classList.toggle('is-invalid', !e.target.checkValidity());
			});

			getElement('registerPassword').addEventListener('input', validatePassword);
		}

		// Login form submit event
		const loginForm = getElement('loginForm');
		if (loginForm) {
			loginForm.addEventListener('submit', (e) => {
				e.preventDefault();

				const payload = {
					email: getElement('loginEmail').value,
					password: getElement('loginPassword').value,
				};

				chrome.runtime.sendMessage({ message: 'login', payload }, (response) => {
					if (response.success) goToSendUrlPage();
					showNotification(response.message, response.success);
				});
			});
		}

		// Send URL form submit event
		const sendUrlForm = getElement('sendUrlForm');
		if (sendUrlForm) {
			sendUrlForm.addEventListener('submit', (e) => {
				e.preventDefault();
				const urlAddress = getElement('urlField').value;

				chrome.runtime.sendMessage(
					{
						message: 'checkUrl',
						payload: { url: urlAddress },
					},
					(response) => {
						showNotification(response.message, response.success);
					}
				);
			});
		}

		// Logout event
		const logOutBtn = getElement('logOutBtn');
		if (logOutBtn) {
			logOutBtn.addEventListener('click', () => {
				chrome.runtime.sendMessage({ message: 'logOut' }, (response) => {
					if (response.success) goToMainPage();
					showNotification(response.message, response.success);
				});
			});
		}

		// Handle extension icon click
		chrome.runtime.sendMessage({ message: 'onStart' }, (response) => {
			if (response.success) {
				goToSendUrlPage();
				chrome.storage.local.get('savedUrl', (result) => {
					if (result.savedUrl) getElement('urlField').value = result.savedUrl;
				});
			} else {
				goToMainPage();
			}
		});
	});
})();
