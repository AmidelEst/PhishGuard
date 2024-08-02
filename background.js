// background.js

let apiUrl = 'http://localhost:3001';

// listen to Messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(request);
	// Use the event property to identify the request type
	if (request.event === 'onStart') {
		checkAuthToken(sendResponse);
		return true; // Keep message channel open for asynchronous response
	}

	if (request.message === 'register') {
		handleRegistration(request.payload)
			.then(sendResponse)
			.catch((err) => {
				console.error(err);
				sendResponse('fail');
			});
		return true; // Keep message channel open for asynchronous response
	}

	if (request.message === 'login') {
		handleLogin(request.payload)
			.then(sendResponse)
			.catch((error) => {
				console.error(error);
				sendResponse({ success: false, message: error.message });
			});
		return true; // Keep message channel open for asynchronous response
	}

	if (request.message === 'logOut') {
		handleLogOut(sendResponse);
		return true; // Keep the message channel open for the asynchronous response
	}
	
	if (request.message === 'checkUrl') {
		console.log('request.payload: ' + request.payload);
		handleCheckUrl(request.payload, sendResponse);
		return true;
	}

	// Default response for unhandled messages
	sendResponse({ success: false, message: 'Unhandled request type' });
	return false; // Synchronous response, no further action required
});
//-----------------------------------------------------
// handler functions

// AuthToken
function checkAuthToken(sendResponse) {
	chrome.storage.local.get('authToken', function (result) {
		if (result.authToken) {
			sendResponse({ success: true, message: 'Token found' });
		} else {
			sendResponse({ success: false, message: 'No token found' });
		}
	});
}
// Registration
function handleRegistration(user_info) {
	// create request
	return (
		fetch(`${apiUrl}/user/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(user_info),
		}) // wait to response from user.js
			// we return from the server, lets start chose what to do with the response
			.then((res) => res.json())
			.then((data) => {
				if (!data.success) {
					throw new Error(data.message);
				}
				return { success: true, message: 'Registration successful' }; // coming back to popup js
			})
			.catch((error) => {
				return { success: false, message: error.message };
			})
	);
}
// Login
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
// LogOut
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
// CheckUrl
function handleCheckUrl(url_info, sendResponse) {
	fetch(`${apiUrl}/url/check_url`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(url_info),
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (!data.success) {
				throw new Error(data.message);
			}
			sendResponse({ success: true, message: 'URL is Safe! :)' });
		})
		.catch((error) => {
			sendResponse({ success: false, message: error.message });
		});

	// Indicate to Chrome that this will be answered asynchronously
	return true;
}
