// /public/popup.js
document.addEventListener('DOMContentLoaded', function () {
	// Elements retrieval
	const mainPage = document.getElementById('mainPage');
	const goToRegisterPage = document.getElementById('goToRegisterPage');
	const goToLoginPage = document.getElementById('goToLoginPage');
	const registerPage = document.getElementById('registerPage');
	const loginPage = document.getElementById('loginPage');
	const registerForm = document.getElementById('registerForm');
	const loginForm = document.getElementById('loginForm');
	const sendUrlPage = document.getElementById('sendUrlPage');
	const logOut = document.getElementById('logOut');
	const apiUrl = 'http://localhost:3001'; // Placeholder, replace with environment-specific URL

	// Navigation event listeners

	//mainPage -> Registeration
	goToRegisterPage.addEventListener('click', function () {
		mainPage.classList.add('hidden');
		registerPage.classList.remove('hidden');
	});
	//mainPage -> Registeration
	const goToMainPage = () => {
		registerPage.classList.add('hidden');
		sendUrlPage.classList.add('hidden');
		mainPage.classList.remove('hidden');
	};
	goToLoginPage.addEventListener('click', function () {
		mainPage.classList.add('hidden');
		loginPage.classList.remove('hidden');
	});

	const goToSendUrlPage = () => {
		loginPage.classList.add('hidden');
		mainPage.classList.add('hidden');
		sendUrlPage.classList.remove('hidden');
	};

	chrome.runtime.sendMessage({ event: 'onStart' }, function (response) {
		if (response && response.success) {
			goToSendUrlPage();
		} else {
			goToMainPage();
		}
	});

	// 1) Register event listener
	if (registerForm) {
		registerForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const registerEmail =
				document.getElementById('registerEmail').value;
			const registerPassword =
				document.getElementById('registerPassword').value;
			const confirmPassword =
				document.getElementById('confirmPassword').value;

			if (registerPassword !== confirmPassword) {
				alert('Passwords do not match.');
				return;
			}
			chrome.runtime.sendMessage(
				{
					message: 'register',
					payload: {
						email: registerEmail,
						password: registerPassword,
					}, // Pass the email and password
				},
				function (response) {
					if (response && response.success) {
						alert('Registration Successful');
						goToMainPage();
					} else {
						alert(`Registration Failed: ${response.message}`);
					}
				}
			);
		});
	}

	// 2) Login event listener
	if (loginForm) {
		loginForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const loginEmail = document.getElementById('loginEmail').value;
			const loginPassword =
				document.getElementById('loginPassword').value;
			chrome.runtime.sendMessage(
				{
					message: 'login',
					payload: {
						email: loginEmail,
						password: loginPassword,
					}, // Pass the email and password
				},
				function (response) {
					if (response && response.success) {
						alert('login Successful');
						goToSendUrlPage();
					} else {
						alert(`login Failed: ${response.message}`);
					}
				}
			);
		});
	}

	logOut.addEventListener('click', () => {
		chrome.runtime.sendMessage({ message: 'logOut' }, function (response) {
			if (response && response.success) {
				alert('Logout Successful');
				goToMainPage();
			} else {
				// This will now properly display the message from the background script, if any
				alert(`Logout Failed: ${response.message}`);
			}
		});
	});
});
