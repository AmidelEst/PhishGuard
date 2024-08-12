(function () {
	// ----------- Utility Functions ------------------//

	const getElement = (id) => document.getElementById(id);

	const showNotification = (message, isSuccess) => {
		const notification = getElement('notification');
		const notificationMessage = getElement('notification-message');
		const backdrop = getElement('backdrop');

		notificationMessage.innerText = message;
		notification.classList.remove('hidden', 'success', 'error');
		backdrop.classList.remove('hidden');

		notification.classList.add(isSuccess ? 'success' : 'error');
	};

	const closeNotification = () => {
		const notification = getElement('notification');
		const backdrop = getElement('backdrop');

		notification.classList.add('hidden');
		backdrop.classList.add('hidden');
	};

	const navigateToPage = (pageId) => {
		const pages = ['mainPage', 'registerPage', 'loginPage', 'sendUrlPage'];
		pages.forEach((page) => getElement(page).classList.add('hidden'));
		getElement(pageId).classList.remove('hidden');
	};

	const hideAllPasswordFeedback = () => {
		const feedbackIds = [
			'passwordLengthFeedback',
			'passwordLetterNumberFeedback',
			'passwordSpecialCharFeedback',
			'passwordNoSpaceEmojiFeedback',
		];
		feedbackIds.forEach((id) => (getElement(id).style.display = 'none'));
	};

	// ----------- Form Validation Functions ------------------//

	const validatePassword = () => {
		const password = getElement('registerPassword').value;
		hideAllPasswordFeedback();

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

	// ----------- Dropdown Population Functions ------------------//
	// to be load upon register
	const populateAdminDropdown = (admins) => {
		const adminDropdown = getElement('adminDropdown');
		adminDropdown.innerHTML = ''; // Clear existing options

		admins.forEach((admin) => {
			const option = document.createElement('option');
			option.value = admin.name; // Assuming email is used as the value
			option.text = admin.name;
			adminDropdown.appendChild(option);
		});
	};

	// to be load upon register
	const populateWhitelistsDropdown = (whitelists) => {
		const whitelistDropdown = getElement('whitelistDropdown');
		whitelistDropdown.innerHTML = ''; // Clear existing options
		if (whitelists && whitelists.length > 0) {
			whitelists.forEach((whitelist) => {
				const option = document.createElement('option');
				option.value = whitelist._id;
				option.text = whitelist.whitelistName;
				whitelistDropdown.appendChild(option);
			});
			whitelistDropdown.disabled = false;
		} else {
			const noWhitelistOption = document.createElement('option');
			noWhitelistOption.value = '';
			noWhitelistOption.text = 'No whitelists available';
			whitelistDropdown.appendChild(noWhitelistOption);
			whitelistDropdown.disabled = true;
		}
	};


	// to be load upon login
	const populateWhitelistUrls = (urls) => {
		const whitelistUrls = getElement('whitelistUrls');
		whitelistUrls.innerHTML = ''; // Clear existing URLs

		if (urls && urls.length > 0) {
			urls.forEach((url) => {
				const listItem = document.createElement('li');
				listItem.classList.add('list-group-item');
				listItem.textContent = url;
				whitelistUrls.appendChild(listItem);
			});
		} else {
			const noUrlsItem = document.createElement('li');
			noUrlsItem.classList.add('list-group-item');
			noUrlsItem.textContent = 'No URLs found in the whitelist.';
			whitelistUrls.appendChild(noUrlsItem);
		}
	};

	// ----------- Fetch Functions ------------------//
	// upon register
	const fetchAdmins = () => {
		chrome.runtime.sendMessage({ message: 'fetchAdmins' }, (response) => {
			if (response.success) {
				populateAdminDropdown(response.admins);
			} else {
				showNotification('Failed to load admin list. Please try again later.', false);
			}
		});
	};
	// upon-register
	const fetchAdminsWhitelists = (selectedAdminName) => {
		console.log(selectedAdminName);
		chrome.runtime.sendMessage(
			{ message: 'fetchAdminsWhitelists', adminName: selectedAdminName },
			(response) => {
				if (response.success) {
					populateWhitelistsDropdown(response.whitelists);
				} else {
					showNotification(
						'Failed to load admin list. Please try again later.',
						false
					);
				}
			}
		);
	};

	//---to be load upon login
	const loadSubscribedWhitelistUrls = () => {
		chrome.storage.local.get('subscribedWhitelist', (result) => {
			if (result.subscribedWhitelist && result.subscribedWhitelist.monitoredSites) {
				populateWhitelistUrls(result.subscribedWhitelist.monitoredSites);
			} else {
				populateWhitelistUrls([]);
			}
		});
	};

	// ---to be load upon login
	const fetchWhitelistUrls = () => {
		chrome.runtime.sendMessage({ message: 'fetchWhitelistUrls' }, (response) => {
			if (response.success) {
				populateWhitelistUrls(response.urls);
			} else {
				showNotification(
					'Failed to load whitelist URLs. Please try again later.',
					false
				);
			}
		});
	};

	// ----------- Event Listeners ------------------//

	document.addEventListener('DOMContentLoaded', () => {
		// Close notification
		getElement('close-notification-button').addEventListener('click', closeNotification);

		// Admin selection
		getElement('adminDropdown').addEventListener('change', (e) => {
			const selectedAdminName = e.target.value;
			if (selectedAdminName) {
				fetchAdminsWhitelists(selectedAdminName);
			} else {
				console.error('Admin email is not defined.');
			}
		});
		// Admin's whitelists selection
		getElement('whitelistDropdown').addEventListener('change', (e) => {
			const selectedAdminName = e.target.value;
			if (selectedAdminName) {
				fetchAdminsWhitelists(selectedAdminName);
			} else {
				console.error('Admin email is not defined.');
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

				const payload = {
					email: getElement('loginEmail').value,
					password: getElement('loginPassword').value,
				};

				chrome.runtime.sendMessage({ message: 'login', payload }, (response) => {
					if (response.success) {
						navigateToPage('sendUrlPage');
						loadSubscribedWhitelistUrls();
					}
					showNotification(response.message, response.success);
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
					if (response.success) navigateToPage('mainPage');
					showNotification(response.message, response.success);
				});
			});
		}

		// Extension icon click
		chrome.runtime.sendMessage({ message: 'onStart' }, (response) => {
			if (response.success) {
				navigateToPage('sendUrlPage');
				chrome.storage.local.get('savedUrl', (result) => {
					if (result.savedUrl) getElement('urlField').value = result.savedUrl;
				});
				loadSubscribedWhitelistUrls();
			} else {
				navigateToPage('mainPage');
			}
		});
	});
})();
