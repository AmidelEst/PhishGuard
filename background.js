// background.js

let apiUrl = 'http://localhost:3001';

// Listen to Messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(request.message);
	switch (request.message) {
		// --onStart--
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
		// regular token needed
		case 'fetchSubscribedWhitelist':
			fetchSubscribedWhitelist(request.subscribedWhitelistId, sendResponse);
			return true;
		// regular token needed
		case 'checkUrl':
			handleCheckUrl(request.payload, sendResponse);
			return true;
		// regular token needed
		case 'checkCertificate':
			handleCheckCertificate(request.payload, sendResponse);
			return true;
		// No tokens needed
		case 'fetchAdmins':
			fetchAdmins(sendResponse);
			return true;
		// No tokens needed
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
// PUBLIC - at registerPage-GET admins
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
// PUBLIC - at registerPage-GET admin's Whitelists
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
						subscribedWhitelistId: data.subscribedWhitelistId,
					},
					() => {
						if (chrome.runtime.lastError) {
							reject(new Error(chrome.runtime.lastError));
						} else {
							resolve({ success: true, message: 'Login successful' });
						}
					}
				);
			});
		});
}
// regularUser TOKEN - after loginPage or at popup press -
function fetchSubscribedWhitelist(subscribedWhitelistId, sendResponse) {
	if (!subscribedWhitelistId) {
		sendResponse({ success: false, message: 'No whitelist ID provided.' });
		return;
	}

	chrome.storage.local.get('authToken', (result) => {
		if (!result.authToken) {
			sendResponse({ success: false, message: 'No token available' });
			return;
		}

		const token = result.authToken;

		fetch(`${apiUrl}/user/whitelist/${subscribedWhitelistId}/monitored-sites`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`, // Fix: added space between Bearer and token
			},
		})
			.then((res) => res.json())
			.then((whitelistData) => {
				if (whitelistData.success) {
					const monitoredSites = whitelistData.monitoredSites || []; // Extract URLs properly

					chrome.storage.local.set({ subscribedWhitelist: monitoredSites }, () => {
						if (chrome.runtime.lastError) {
							console.error(
								'Error storing monitored sites:',
								chrome.runtime.lastError
							);
							sendResponse({
								success: false,
								message: chrome.runtime.lastError,
							});
						} else {
							sendResponse({ success: true, monitoredSites: monitoredSites });
						}
					});
				} else {
					console.error('Failed to fetch monitored sites:', whitelistData.message);
					sendResponse({
						success: false,
						message: whitelistData.message || 'Failed to fetch monitored sites.',
					});
				}
			})
			.catch((error) => {
				console.error('Error fetching monitored sites:', error);
				sendResponse({ success: false, message: 'Error fetching monitored sites.' });
			});
	});
}
// regularUser TOKEN - CheckCertificate
function handleCheckCertificate(submittedURL, sendResponse) {
	chrome.storage.local.get('authToken', (result) => {
		if (result.authToken) {
			fetch(`${apiUrl}/sites/check_cv`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${result.authToken}`,
				},
				body: JSON.stringify(submittedURL),
			})
				.then((res) => res.json())
				.then((data) => {
					console.log(data)
					sendResponse({ success: data.success, message: data.message });
				})
				.catch((error) => {
					sendResponse({ success: false, message: error.message });
				});
		} else {
			sendResponse({ success: false, message: 'Not authenticated' });
		}
	});
}
// regularUser TOKEN - checkUrl
function handleCheckUrl(submittedURL, sendResponse) {
	chrome.storage.local.get('authToken', (result) => {
		if (result.authToken) {
			fetch(`${apiUrl}/sites/check_url`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${result.authToken}`,
				},
				body: JSON.stringify(submittedURL),
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
// 2) handle LogOut
function handleLogOut(sendResponse) {
	// Remove the token and user status from local storage
	chrome.storage.local.get('authToken', (result) => {
		const token = result.authToken;

		// Proceed if the token exists
		if (token) {
			chrome.storage.local.remove(['authToken', 'userStatus'], () => {
				if (chrome.runtime.lastError) {
					sendResponse({ success: false, message: chrome.runtime.lastError });
				} else {
					// Send the token to the server for blacklisting
					fetch(`${apiUrl}/user/logout`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`, // Send the token to identify the session
						},
					})
						.then((res) => res.json())
						.then((data) => {
							if (data.success) {
								// Optionally set userStatus to 'loggedOut' to keep track
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
		} else {
			sendResponse({ success: false, message: 'No token found in storage' });
		}
	});
}
