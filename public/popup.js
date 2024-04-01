// /public/popup.js
document.addEventListener('DOMContentLoaded', function () {
	// Elements retrieval
	const goToRegisterPage = document.getElementById('goToRegisterPage');
	const goToLoginPage = document.getElementById('goToLoginPage');
	const mainPage = document.getElementById('mainPage'); // Ensure mainPage is defined
	const registerPage = document.getElementById('registerPage');
	const loginPage = document.getElementById('loginPage');
	const registerForm = document.getElementById('registerForm');
	const loginForm = document.getElementById('loginForm');
	const apiUrl = 'http://localhost:3001'; // Placeholder, replace with environment-specific URL

	chrome.runtime.sendMessage({ event: 'onStart' });

	// Navigation event listeners
	goToRegisterPage.addEventListener('click', function () {
		mainPage.classList.add('hidden');
		registerPage.classList.remove('hidden');
	});

	goToLoginPage.addEventListener('click', function () {
		mainPage.classList.add('hidden');
		loginPage.classList.remove('hidden');
	});
	const goToMainPage = () => {
		registerPage.classList.add('hidden');
		mainPage.classList.remove('hidden');
	};

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
			try {
				const response = await fetch(`${apiUrl}/user/register`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: registerEmail,
						password: registerPassword,
					}),
				});
				const data = await response.json();
				if (data.success) {
					alert('Success: ' + data.message);
					goToMainPage();
				} else {
					throw new Error(data.message);
				}
			} catch (error) {
				alert('Error: ' + error.message);
			}
		});
	} else {
		console.error('Register form element not found!');
	}

	// 2) Login event listener
	if (loginForm) {
		loginForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const loginEmail = document.getElementById('loginEmail').value;
			const loginPassword =
				document.getElementById('loginPassword').value;

			try {
				const response = await fetch(`${apiUrl}/user/login`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: loginEmail,
						password: loginPassword,
					}),
				});

				if (!response.ok) {
					throw new Error('Network response was not ok');
				}

				const data = await response.json();
				if (data.success) {
					alert('Login successful!');
					console.log('Setting token in storage');
					chrome.storage.local.set({ token: data.token }, () => {
						console.log('Token is saved in Chrome storage');
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
		});
	} else {
		console.error('Login form element not found!');
	}
});
