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

// implement register
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
				.then((response) => response.text())
				.then((data) => {
					console.log('Success:', data);
				})
				.catch((error) => {
					console.error('Error:', error);
				});
		});
	} else {
		console.error('Form element not found!');
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
				.then((response) => response.json()) // Convert the response to JSON
				.then((data) => {
					// Handle response data
					console.log('Login Successful:', data);
					if (data.success) {
						// Perform actions upon successful login, e.g., storing the token, updating UI
						// Assuming your server responds with a token on successful login
						chrome.storage.local.set(
							{ token: data.token },
							function () {
								console.log('Token is saved in Chrome storage');
							}
						);

						// Optionally, close the popup or display a success message
					} else {
						// Handle login failures, e.g., display an error message to the user
						alert('Login failed: ' + data.message);
					}
				})
				.catch((error) => {
					console.error('Login Error:', error);
					alert('Login error, please try again.');
				});
		});
	} else {
		console.error('Login form not found!');
	}
});

