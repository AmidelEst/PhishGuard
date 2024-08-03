// /public/popup.js

// Immediately Invoked Function Expression (IIFE)
//(to avoid polluting the global scope)
(function () {
	// show the notification
	function showNotification(message, success) {
		const notification = document.getElementById('notification');
		const notificationMessage = document.getElementById('notification-message');
		const backdrop = document.getElementById('backdrop');

		notificationMessage.innerText = message;
		notification.classList.remove('hidden', 'success', 'error');
		backdrop.classList.remove('hidden');

		if (success) {
			notification.classList.add('success');
		} else {
			notification.classList.add('error');
		}

		notification.style.display = 'block';
		backdrop.style.display = 'block';
	}

	// Function to close the notification
	function closeNotification() {
		const notification = document.getElementById('notification');
		const backdrop = document.getElementById('backdrop');

		notification.classList.add('hidden');
		backdrop.classList.add('hidden');
	}

	// Add event listener to the close button
	document.addEventListener('DOMContentLoaded', function () {
		document
			.getElementById('close-notification-button')
			.addEventListener('click', closeNotification);
	});

	// Expose showNotification function to the global scope
	window.showNotification = showNotification;
})();

//------------Navigation buttons------------------------------------//
(function () {
	const registerPage = document.getElementById('registerPage');
	const sendUrlPage = document.getElementById('sendUrlPage');
	const loginPage = document.getElementById('loginPage');
	const mainPage = document.getElementById('mainPage');

	const goToMainPage = () => {
		registerPage.classList.add('hidden');
		sendUrlPage.classList.add('hidden');
		loginPage.classList.add('hidden');
		mainPage.classList.remove('hidden');
	};

	document.getElementById('goBackBtnFromRegister').addEventListener('click', goToMainPage);
	document.getElementById('goBackBtnFromLogin').addEventListener('click', goToMainPage);
})();

document.addEventListener('DOMContentLoaded', function () {
	// -----------Elements retrieval------------------//

	//------------Pages Binding------------------//
	const mainPage = document.getElementById('mainPage');
	const registerPage = document.getElementById('registerPage');
	const loginPage = document.getElementById('loginPage');
	const sendUrlPage = document.getElementById('sendUrlPage');

	//------------listeners to buttons in main page---//
	const goToRegister = document.getElementById('goToRegister');
	const goToLogin = document.getElementById('goToLogin');
	const logOutBtn = document.getElementById('logOutBtn');
	//------------Forms Binding------------------------------------//

	//------------listeners to *FORM's* submit button-//
	const registerForm = document.getElementById('registerForm'); //listens to *register* submit button
	const loginForm = document.getElementById('loginForm'); //listens to *register* submit button
	const sendUrlForm = document.getElementById('sendUrlForm');
	const urlField = document.getElementById('urlField');
	//---------------------------------------------------//

	//mainPage -> Registration
	goToRegister.addEventListener('click', function () {
		mainPage.classList.add('hidden');
		registerPage.classList.remove('hidden');
	});

	//mainPage -> LoginPage
	goToLogin.addEventListener('click', function () {
		mainPage.classList.add('hidden');
		loginPage.classList.remove('hidden');
	});

	//any -> mainPage -> Registration
	const goToMainPage = () => {
		registerPage.classList.add('hidden');
		sendUrlPage.classList.add('hidden');
		loginPage.classList.add('hidden');
		mainPage.classList.remove('hidden');
	};
	//any -> Send Url Page
	const goToSendUrlPage = () => {
		loginPage.classList.add('hidden');
		mainPage.classList.add('hidden');
		registerPage.classList.add('hidden');
		sendUrlPage.classList.remove('hidden');
	};

	//-----------------!end of HTML Basic binding!-------------------------------//

	// 0) clicking on our extension icon
	chrome.runtime.sendMessage({ event: 'onStart' }, function (response) {
		if (response.success) {
			goToSendUrlPage();
			// Retrieve the saved URL when the popup is opened
			chrome.storage.local.get('savedUrl', function (result) {
				if (result.savedUrl) {
					urlField.value = result.savedUrl;
				}
			});
		} else {
			goToMainPage();
		}
	});

	// 1) Register event listener
	const passwordLengthFeedback = document.getElementById('passwordLengthFeedback');
	const passwordLetterNumberFeedback = document.getElementById(
		'passwordLetterNumberFeedback'
	);
	const passwordSpecialCharFeedback = document.getElementById('passwordSpecialCharFeedback');
	const passwordNoSpaceEmojiFeedback = document.getElementById(
		'passwordNoSpaceEmojiFeedback'
	);

	if (registerForm) {
		registerForm.addEventListener('submit', async (e) => {
			e.preventDefault();

			const password = registerPassword.value;
			let isValid = true;

			// Reset custom validity messages and hide all feedback
			registerPassword.setCustomValidity('');
			hideAllFeedback();

			// Custom validation checks
			if (password.length < 8 || password.length > 20) {
				passwordLengthFeedback.style.display = 'block';
				registerPassword.setCustomValidity('Invalid');
				isValid = false;
			} else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
				passwordLetterNumberFeedback.style.display = 'block';
				registerPassword.setCustomValidity('Invalid');
				isValid = false;
			} else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
				passwordSpecialCharFeedback.style.display = 'block';
				registerPassword.setCustomValidity('Invalid');
				isValid = false;
			} else if (/\s/.test(password) || /[\uD800-\uDFFF]/.test(password)) {
				passwordNoSpaceEmojiFeedback.style.display = 'block';
				registerPassword.setCustomValidity('Invalid');
				isValid = false;
			}

			if (registerPassword.value !== confirmPassword.value) {
				confirmPassword.setCustomValidity('Passwords do not match.');
				confirmPassword.classList.add('is-invalid');
				isValid = false;
			} else {
				confirmPassword.setCustomValidity('');
				confirmPassword.classList.remove('is-invalid');
			}

			if (!isValid) {
				registerPassword.classList.add('is-invalid');
				registerForm.classList.add('was-validated');
				return;
			}

			// Proceed with form submission
			const payload = {
				email: document.getElementById('registerEmail').value,
				password: registerPassword.value,
			};

			chrome.runtime.sendMessage({ message: 'register', payload }, function (response) {
				if (response.success) {
					goToMainPage();
				}
				showNotification(response.message, response.success);
			});
		});

		registerForm.addEventListener('input', function (e) {
			if (e.target.checkValidity()) {
				e.target.classList.remove('is-invalid');
			} else {
				e.target.classList.add('is-invalid');
			}
		});

		registerPassword.addEventListener('input', function () {
			confirmPassword.setCustomValidity('');
			confirmPassword.classList.remove('is-invalid');
			validatePassword();
		});
	}

	function hideAllFeedback() {
		passwordLengthFeedback.style.display = 'none';
		passwordLetterNumberFeedback.style.display = 'none';
		passwordSpecialCharFeedback.style.display = 'none';
		passwordNoSpaceEmojiFeedback.style.display = 'none';
	}

	function validatePassword() {
		const password = registerPassword.value;
		hideAllFeedback();

		if (password.length < 8 || password.length > 20) {
			passwordLengthFeedback.style.display = 'block';
		} else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
			passwordLetterNumberFeedback.style.display = 'block';
		} else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
			passwordSpecialCharFeedback.style.display = 'block';
		} else if (/\s/.test(password) || /[\uD800-\uDFFF]/.test(password)) {
			passwordNoSpaceEmojiFeedback.style.display = 'block';
		}
	}

	// 2) Login event listener
	if (loginForm) {
		loginForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const loginEmail = document.getElementById('loginEmail').value;
			const loginPassword = document.getElementById('loginPassword').value;
			chrome.runtime.sendMessage(
				{
					message: 'login',
					payload: {
						email: loginEmail,
						password: loginPassword,
					}, // Pass the email and password
				},
				function (response) {
					if (response.success) goToSendUrlPage();
					showNotification(`${response.message}`, response.success);
				}
			);
		});
	}

	// 3) get url to check
	// Save the URL whenever it changes
	if (urlField) {
		urlField.addEventListener('input', function () {
			chrome.storage.local.set({ savedUrl: urlField.value });
		});
	}
	sendUrlForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const urlAddress = document.getElementById('urlField').value;
		console.log('site to seek: ' + urlAddress);
		chrome.runtime.sendMessage(
			{
				message: 'checkUrl',
				payload: {
					url: urlAddress,
				},
			},
			function (response) {
				showNotification(`${response.message}`, response.success);
			}
		);
	});

	// 4) logOut event listener
	logOutBtn.addEventListener('click', () => {
		chrome.runtime.sendMessage({ message: 'logOut' }, function (response) {
			if (response.success) goToMainPage();

			showNotification(response.message, response.success);
		});
	});
});
