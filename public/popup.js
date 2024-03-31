// public/popup.js
document.addEventListener('DOMContentLoaded', function () {
	// Elements retrieval

	//navigation button
	const goToRegisterPage = document.getElementById('goToRegisterPage');
	const goToLoginPage = document.getElementById('goToLoginPage');
	// form retrieval
	const registerPage = document.getElementById('registerPage');
	const loginPage = document.getElementById('loginPage');
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
});

// Register
document.addEventListener('DOMContentLoaded', function () {
	const registerForm = document.getElementById('registerForm'); // Corrected the ID here
	if (registerForm) {
		registerForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const registerEmail =
				document.getElementById('registerEmail').value;
			const registerPassword =
				document.getElementById('registerPassword').value;
			fetch('http://localhost:3001/user/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: registerEmail,
					password: registerPassword,
				}), // Ensure these keys match your backend's expected format
			})
				.then((response) => response.json()) // Parse the JSON from the response
				.then((data) => {
					if (data.success) {
						alert('Success: ' + data.message);
					} else {
						// Even if the response is a 4XX, we handle it here due to the response being parsed as JSON
						throw new Error(data.message);
					}
				})
				.catch((error) => {
					// This catches network errors and errors thrown from the previous block
					alert('Error: ' + error.message);
				});
		});
	} else {
		console.error('Form element not found!');
		alert('Form element not found!');
	}
});

// implement login
document.addEventListener('DOMContentLoaded', function () {
	const loginForm = document.getElementById('loginForm'); // Corrected the ID here
	if (loginForm) {
		loginForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const loginEmail = document.getElementById('loginEmail').value;
			const loginPassword =
				document.getElementById('loginPassword').value;
			console.log(loginEmail, loginPassword);
			fetch('http://localhost:3001/user/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: loginEmail,
					password: loginPassword,
				}), // Ensure the object keys match your server's expected fields
			})
				.then((response) => {
					if (!response.ok) {
						// If the server response is not ok, we throw an error to jump directly to the catch block
						throw new Error('Network response was not ok');
					}
					return response.json(); // We parse the response as JSON
				})
				.then((data) => {
					if (data.success) {
						alert('Login successful!'); // Display a success message
						chrome.storage.local.set(
							{ token: data.token },
							function () {
								console.log('Token is saved in Chrome storage');
							}
						);
						// Additional actions upon successful login can be performed here
					} else {
						// If the login was not successful, display an error message from the server
						throw new Error('Login failed: ' + data.message);
					}
				})
				.catch((error) => {
					// Handles any network error or manual error thrown from the then block
					console.error('Login Error:', error);
					alert('Error: ' + error.message);
				});
		});
	} else {
		console.error('Login form not found!');
		alert('Login form not found!');
	}
});
