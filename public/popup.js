// /public/popup.js
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

	// Simplify navigation with a reusable function
	const togglePageVisibility = (hidePage, showPage) => {
		hidePage.classList.add('hidden');
		showPage.classList.remove('hidden');
	};

	// Navigation event listeners
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
		});
	} else {
		console.error('Login form element not found!');
	}
});
