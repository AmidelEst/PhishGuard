let apiUrl = 'http://localhost:3001'; // Ensure this points to your actual API

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(request);
	// Use the event property to identify the request type
	if (request.event === 'onStart') {
		checkAuthToken(sendResponse);
		return true; // Necessary for asynchronous sendResponse
	}

	if (request.message === 'register') {
		handleRegistration(request.payload)
			.then(sendResponse)
			.catch((err) => {
				console.error(err);
				sendResponse('fail');
			});
		return true; // Keep the message channel open for the asynchronous response
	}

	if (request.message === 'login') {
		handleLogin(request.payload)
			.then(sendResponse)
			.catch((error) => {
				console.error(error);
				sendResponse({ success: false, message: error.message });
			});
		return true;
	}

	if (request.message === 'logOut') {
		handleLogOut(sendResponse);
		return true;
	}

	// Default response for unhandled messages
	sendResponse({ success: false, message: 'Unhandled request type' });
	return false; // Synchronous response, no further action required
});

function checkAuthToken(sendResponse) {
	chrome.storage.local.get('authToken', function (result) {
		if (result.authToken) {
			sendResponse({ success: true, message: 'Token found' });
		} else {
			sendResponse({ success: false, message: 'No token found' });
		}
	});
}

function handleRegistration(user_info) {
	return fetch(`${apiUrl}/user/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user_info),
	})
		.then((res) => res.json())
		.then((data) => {
			if (!data.success) {
				throw new Error(data.message);
			}
			return { success: true, message: 'Registration successful' };
		})
		.catch((error) => {
			return { success: false, message: error.message };
		});
}

function handleLogin(userCredentials) {
	return fetch(`${apiUrl}/user/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(userCredentials),
	})
		.then((res) => res.json())
		.then((data) => {
			if (!data.success) {
				throw new Error(data.message);
			}
			return new Promise((resolve, reject) => {
				chrome.storage.local.set(
					{
						userStatus: 'loggedIn',
						authToken: data.token,
					},
					() => {
						if (chrome.runtime.lastError) {
							reject(new Error(chrome.runtime.lastError));
						} else {
							resolve({
								success: true,
								message: 'Login successful',
							});
						}
					}
				);
			});
		})
		.catch((error) => {
			return { success: false, message: error.message };
		});
}

function handleLogOut(sendResponse) {
	chrome.storage.local.remove('authToken', () => {
		if (chrome.runtime.lastError) {
			console.error(
				'Error clearing auth token:',
				chrome.runtime.lastError
			);
			sendResponse({ success: false, message: chrome.runtime.lastError });
		} else {
			console.log('Successfully logged out.');
			user_signed_in = false;
			sendResponse({ success: true, message: 'Logged out successfully' });
		}
	});
}
