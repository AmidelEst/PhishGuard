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

		// 1) login
		case 'login':
			handleLogin(request.payload)
				.then(sendResponse)
				.catch((error) => {
					console.error(error);
					sendResponse({ success: false, message: 'Login failed' });
				});
			return true;

		// 2) logOut
		case 'logOut':
			handleLogOut(sendResponse);
			return true;

		case 'checkUrl':
			handleCheckUrl(request.payload, sendResponse);
			return true;

		case 'fetchAdmins':
			fetchAdmins(sendResponse);
			return true;

		case 'fetchAdminsWhitelists':
			fetchAdminsWhitelists(request.adminName, sendResponse);
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
	chrome.storage.local.get(['authToken', 'userStatus'], function (result) {
		if (typeof result.userStatus === 'undefined') {
			// If userStatus is undefined, remove it from storage
			chrome.storage.local.remove('userStatus', () => {
				if (chrome.runtime.lastError) {
					console.error('Error removing userStatus:', chrome.runtime.lastError);
				}
			});
		}

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
				chrome.storage.local.set(
					{
						userStatus: 'loggedIn',
						authToken: data.token,
						subscribedWhitelist: data.subscribedWhitelist,
					},
					() => {
						if (chrome.runtime.lastError) {
							console.error(
								'Error storing auth token:',
								chrome.runtime.lastError
							);
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
	chrome.storage.local.remove(['authToken', 'userStatus'], () => {
		if (chrome.runtime.lastError) {
			console.error(
				'Error clearing auth token or user status:',
				chrome.runtime.lastError
			);
			sendResponse({ success: false, message: chrome.runtime.lastError });
		} else {
			fetch(`${apiUrl}/user/logout`, {
				method: 'POST',
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.success) {
						// Optionally set userStatus to 'loggedOut' if you want to keep track of it
						chrome.storage.local.set({ userStatus: 'loggedOut' }, () => {
							sendResponse({ success: true, message: data.message });
						});
					} else {
						sendResponse({ success: false, message: data.message });
					}
				})
				.catch((error) => {
					sendResponse({ success: false, message: error.message });
				});
		}
	});
}

//
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

// admins list
function fetchAdmins(sendResponse) {
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
// Fetch Admin's Whitelists
function fetchAdminsWhitelists(adminName, sendResponse) {
	fetch(`${apiUrl}/user/adminsWhitelists?adminName=${encodeURIComponent(adminName)}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				sendResponse({ success: true, whitelists: data.whitelists });
			} else {
				sendResponse({ success: false, message: 'Failed to fetch whitelists' });
			}
		})
		.catch((error) => {
			sendResponse({ success: false, message: error.message });
		});
}

function fetchUsersSubscribedWhitelist(subscribedWhitelistId, token, sendResponse) {
	fetch(`${apiUrl}/user/whitelist/${subscribedWhitelistId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	})
		.then((res) => res.json())
		.then((whitelistData) => {
			if (whitelistData.success) {
				// Store the subscribed whitelist data
				chrome.storage.local.set(
					{
						subscribedWhitelist: whitelistData.whitelist,
					},
					() => {
						if (chrome.runtime.lastError) {
							console.error(
								'Error storing subscribed whitelist:',
								chrome.runtime.lastError
							);
							sendResponse({
								success: false,
								message: chrome.runtime.lastError,
							});
						} else {
							sendResponse({
								success: true,
								message: 'Login successful',
							});
						}
					}
				);
			} else {
				console.error('Failed to fetch whitelist:', whitelistData.message);
				sendResponse({
					success: false,
					message: 'Failed to fetch subscribed whitelist.',
				});
			}
		})
		.catch((error) => {
			console.error('Error fetching whitelist:', error);
			sendResponse({ success: false, message: 'Error fetching subscribed whitelist.' });
		});
}
