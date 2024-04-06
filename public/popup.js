// /public/popup.js
<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
	// Cache DOM elements for efficiency
	const elements = {
		goToRegisterPage: document.getElementById('goToRegisterPage'),
		goToLoginPage: document.getElementById('goToLoginPage'),
		mainPage: document.getElementById('mainPage'),
		registerPage: document.getElementById('registerPage'),
		loginPage: document.getElementById('loginPage'),
		registerForm: document.getElementById('registerForm'),
		loginForm: document.getElementById('loginForm'),
		apiUrl: 'http://localhost:3001', // Use HTTPS
	};

	chrome.runtime.sendMessage({ event: 'onStart' });
=======
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
>>>>>>> check1

	// Simplify navigation with a reusable function
	const togglePageVisibility = (hidePage, showPage) => {
		hidePage.classList.add('hidden');
		showPage.classList.remove('hidden');
	};

	// Navigation event listeners
<<<<<<< HEAD
	elements.goToRegisterPage.addEventListener('click', () =>
		togglePageVisibility(elements.mainPage, elements.registerPage)
	);
	elements.goToLoginPage.addEventListener('click', () =>
		togglePageVisibility(elements.mainPage, elements.loginPage)
	);

	// Register event listener
	if (elements.registerForm) {
		elements.registerForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const { registerEmail, registerPassword, confirmPassword } =
				e.target.elements;

			if (registerPassword.value !== confirmPassword.value) {
				alert('Passwords do not match.');
				return;
			}

			// Send message to background script
			chrome.runtime.sendMessage(
				{
					contentScriptQuery: 'fetchUrl',
					url: `${elements.apiUrl}/user/register`,
					data: {
						email: registerEmail.value,
						password: registerPassword.value,
					},
				},
				(response) => {
					// Handle the response from the background script
					if (response.success) {
						alert('Success: ' + response.message);
						togglePageVisibility(
							elements.registerPage,
							elements.mainPage
						);
					} else {
						// Assuming the background script sends back an error in a predictable format
						alert(
							'Error: ' + (response.message || 'Unknown error')
						);
					}
				}
			);
		});
	}

	// Login event listener
	if (elements.loginForm) {
		elements.loginForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const { loginEmail, loginPassword } = e.target.elements;

			try {
				const response = await fetch(`${elements.apiUrl}/user/login`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: loginEmail.value,
						password: loginPassword.value,
					}),
				});

				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				const data = await response.json();
				if (data.success) {
					alert('Login successful!');
					chrome.storage.local.set({ token: data.token }, () => {
						if (chrome.runtime.lastError) {
							console.error(
								'Error setting token:',
								chrome.runtime.lastError
							);
						}
					});
				} else {
					throw new Error('Login failed: ' + data.message);
				}
			} catch (error) {
				console.error('Login Error:', error);
				alert('Error: ' + error.message);
			}
=======

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
>>>>>>> check1
		});
	} else {
		console.error('Login form element not found!');
	}
<<<<<<< HEAD
=======

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
>>>>>>> check1
});
