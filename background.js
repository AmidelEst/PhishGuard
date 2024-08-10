// background.js

let apiUrl = 'http://localhost:3001';

// Listen to Messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(request);

	switch (request.message) {
		case 'onStart':
			checkAuthToken(sendResponse);
			return true;

		// 0) register
		case 'register':
			handleRegistration(request.payload)
				.then(sendResponse)
				.catch((err) => {
					console.error(err);
					sendResponse({ success: false, message: 'Registration failed' });
				});
			return true;

		case 'fetchAdminList':
			fetchAdminList(sendResponse);
			return true;

		// 1) login
		case 'login':
			handleLogin(request.payload)
				.then(sendResponse)
				.catch((error) => {
					console.error(error);
					sendResponse({ success: false, message: 'Login failed' });
				});
			return true;

		// 3) logOut
		case 'logOut':
			handleLogOut(sendResponse);
			return true;

		// 4) checkUrl
		case 'checkUrl':
			handleCheckUrl(request.payload, sendResponse);
			return true;

		default:
			sendResponse({ success: false, message: 'Unhandled request type' });
			return true;
	}

	return true; // Keep message channel open for asynchronous response
});

//-----------------------------------------------------
// Handler functions

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

// 0) handle register
function handleRegistration(user_info) {
	return fetch(`${apiUrl}/user/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user_info),
	})
		.then((res) => res.json())
		.then((data) => {
			return { success: data.success, message: data.message };
		});
}

// 1) handle Login
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
				console.log(userStatus, data.token);
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
// 2) handle LogOut
function handleLogOut(sendResponse) {
	chrome.storage.local.remove('authToken', () => {
		if (chrome.runtime.lastError) {
			console.error('Error clearing auth token:', chrome.runtime.lastError);
			sendResponse({ success: false, message: chrome.runtime.lastError });
		} else {
			fetch(`${apiUrl}/user/logout`, {
				method: 'POST',
			})
				.then((res) => res.json())
				.then((data) => {
					sendResponse({ success: data.success, message: data.message });
				})
				.catch((error) => {
					sendResponse({ success: false, message: error.message });
				});
		}
	});
}

function handleCheckUrl(url_info, sendResponse) {
	chrome.storage.local.get('authToken', (result) => {
		if (result.authToken) {
			fetch(`${apiUrl}/url/check_url`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${result.authToken}`,
				},
				body: JSON.stringify(url_info),
			})
				.then((res) => res.json())
				.then((data) => {
					sendResponse({ success: data.success, message: data.message });
				})
				.catch((error) => {
					sendResponse({ success: false, message: error.message });
				});
		} else {
			sendResponse({ success: false, message: 'Not authenticated' });
		}
	});

	return true;
}
// Handler function to fetch admin list
function fetchAdminList(sendResponse) {
	fetch(`${apiUrl}/user/admin-list`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((res) => res.json())
		.then((data) => {
			if (!data.success) {
				throw new Error(data.message);
			}
			sendResponse({ success: true, admins: data.admins });
		})
		.catch((error) => {
			sendResponse({ success: false, message: error.message });
		});
}
