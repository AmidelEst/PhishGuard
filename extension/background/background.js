//------------------------------------------------//
// extension/background/background.js
let apiUrl = 'http://localhost:3001';
// ~------------Listen to Messages----------------//
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(request.message);
	switch (request.message) {
		// --onStart-- //? checkAuthToken
		case 'onStart':
			checkAuthToken(sendResponse);
			return true;
		//* 0) register
		case 'register':
			handleRegistration(request.payload)
				.then(sendResponse)
				.catch(err => {
					sendResponse({ success: false, message: 'Registration failed' });
				});
			return true;
		//? 1) login
		case 'login':
			handleLogin(request.payload)
				.then(sendResponse)
				.catch(error => {
					sendResponse({ success: false, message: 'Login failed' });
				});
			return true;
		//? 2) logout
		case 'logout':
			handleLogout(sendResponse);
			return true;
		//^ token needed
		case 'fetchSubscribedWhitelist':
			fetchSubscribedWhitelist(request.subscribedWhitelistId, sendResponse);
			return true;
		//! stage 2: check CV
		case 'checkCertificate':
			handleCheckCertificate(request.payload, sendResponse);
			return true;
		//!	stage 3: checkMinHash
		case 'checkMinMash':
			handlerCheckMinMash(request.payload, sendResponse);
			return true;
		case 'createNewQuery':
			handlerCreateNewQuery(request.payload, sendResponse);
			return true;
		//* PUBLIC
		case 'fetchAdmins':
			fetchAdmins(sendResponse);
			return true;
		//* PUBLIC
		case 'fetchAdminsWhitelists':
			fetchAdminsWhitelists(request.adminName, sendResponse);
			return true;
		//
		default:
			sendResponse({ success: false, message: 'Unhandled request type' });
			return true;
	}
	return true; // Keep message channel open for asynchronous response
});
//& ---------Handler functions--------------------//
//? ---------Token Assigning Process--------------//
//?
function checkAuthToken(sendResponse) {
	chrome.storage.local.get(['authToken'], function (result) {
		if (result.authToken) {
			sendResponse({ success: true, message: 'Token found' });
		} else {
			sendResponse({ success: false, message: 'No token found' });
		}
	});
}
//?
function refreshAccessToken() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('refreshToken', function (result) {
			const refreshToken = result.refreshToken;

			fetch(`${apiUrl}/user/refresh-token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refreshToken })
			})
				.then(res => res.json())
				.then(data => {
					if (!data.success) {
						return reject('Failed to refresh token');
					}

					chrome.storage.local.set({ authToken: data.accessToken }, () => {
						resolve(data.accessToken);
					});
				})
				.catch(err => reject(err));
		});
	});
}
//? Helper function to retrieve auth and refresh tokens from chrome storage
function getTokens() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(['authToken', 'refreshToken'], result => {
			if (!result.authToken) {
				reject('No auth token available');
			} else {
				resolve({
					authToken: result.authToken,
					refreshToken: result.refreshToken
				});
			}
		});
	});
}
//?
function isTokenExpired(token) {
	const decodedToken = JSON.parse(atob(token.split('.')[1]));
	return decodedToken.exp * 1000 < Date.now();
}
//? Login handler
function handleLogin(userCredentials) {
	return fetch(`${apiUrl}/user/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(userCredentials)
	})
		.then(res => res.json())
		.then(data => {
			if (!data.success) {
				throw new Error(data.message);
			}

			return new Promise((resolve, reject) => {
				// Store login details in chrome.storage.local
				chrome.storage.local.set(
					{
						userStatus: 'loggedIn',
						authToken: data.accessToken,
						refreshToken: data.refreshToken, // Store refresh token
						subscribedWhitelistId: data.subscribedWhitelistId
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
//? LogOut handler
function handleLogout(sendResponse) {
	chrome.storage.local.get(['authToken', 'refreshToken'], result => {
		const authToken = result.authToken;
		const refreshToken = result.refreshToken;

		// Proceed only if both tokens exist
		if (authToken && refreshToken) {
			// Send the token to the server for blacklisting
			fetch(`${apiUrl}/user/logout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${authToken}` // Send the token to identify the session
				},
				body: JSON.stringify({ refreshToken }) // Send the refresh token in the body
			})
				.then(res => res.json())
				.then(data => {
					if (data.success) {
						// Clear tokens from storage and update user status
						chrome.storage.local.remove(['authToken', 'refreshToken', 'userStatus'], () => {
							if (chrome.runtime.lastError) {
								// Handle any runtime errors when removing from storage
								return sendResponse({ success: false, message: chrome.runtime.lastError.message });
							}
							// Set userStatus to 'loggedOut' after clearing tokens
							chrome.storage.local.set({ userStatus: 'loggedOut' }, () => {
								sendResponse({ success: true, message: 'Logged out successfully' });
							});
						});
					} else {
						// Handle server response failure
						sendResponse({ success: false, message: data.message || 'Logout failed on the server' });
					}
				})
				.catch(error => {
					// Handle fetch errors
					sendResponse({ success: false, message: error.message || 'Network error during logout' });
				});
		} else {
			// No tokens found
			sendResponse({ success: false, message: 'No tokens found in storage' });
		}
	});

	// Ensure async sendResponse is handled properly
	return true; // Keep the message channel open for async sendResponse
}
//^----------WITH TOKEN ACTIONS - PRIVATE---------//
//^ after loginPage or at popup press
function fetchSubscribedWhitelist(subscribedWhitelistId, sendResponse) {
	if (!subscribedWhitelistId) {
		sendResponse({ success: false, message: 'No whitelist ID provided.' });
		return;
	}

	chrome.storage.local.get('authToken', result => {
		if (!result.authToken) {
			sendResponse({ success: false, message: 'No token available' });
			return;
		}

		const token = result.authToken;

		fetch(`${apiUrl}/user/whitelist/${subscribedWhitelistId}/monitored-sites`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		})
			.then(res => res.json())
			.then(whitelistData => {
				if (whitelistData.success) {
					const monitoredSites = whitelistData.monitoredSites || []; // Extract URLs properly

					chrome.storage.local.set({ subscribedWhitelist: monitoredSites }, () => {
						if (chrome.runtime.lastError) {
							sendResponse({
								success: false,
								message: chrome.runtime.lastError
							});
						} else {
							sendResponse({ success: true, monitoredSites: monitoredSites });
						}
					});
				} else {
					sendResponse({
						success: false,
						message: whitelistData.message || 'Failed to fetch monitored sites.'
					});
				}
			})
			.catch(error => {
				sendResponse({ success: false, message: error.message });
			});
	});
}
//!----------ALGORITHMS ----------PRIVATE---------//
//! stage 2: check CV handler
function handleCheckCertificate(submittedURL, sendResponse) {
	chrome.storage.local.get('authToken', result => {
		if (result.authToken) {
			fetch(`${apiUrl}/sites/check_cv`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${result.authToken}`
				},
				body: JSON.stringify(submittedURL)
			})
				.then(res => res.json())
				.then(data =>
					data.success
						? sendResponse({ success: true, message: data.message })
						: sendResponse({ success: false, message: data.message })
				)
				.catch(error => sendResponse({ success: false, message: error.message }));
		} else {
			return sendResponse({ success: false, message: 'Not authenticated' });
		}
	});
}
//! stage 3: checkMinHash handler
function handlerCheckMinMash(submittedURL, sendResponse) {
	chrome.storage.local.get('authToken', result => {
		if (result.authToken) {
			fetch(`${apiUrl}/sites/check_url`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${result.authToken}`
				},
				body: JSON.stringify(submittedURL)
			})
				.then(res => res.json())
				.then(data => {
					sendResponse({ success: data.success, message: data.message });
				})
				.catch(error => {
					sendResponse({ success: false, message: error });
				});
		} else {
			return sendResponse({ success: false, message: 'Not authenticated' });
		}
	});

	return true;
}

//! stage 4: handlerCreateNewQuery
function handlerCreateNewQuery(canonicalUrl, submittedURLCopy, isInSubscribedWhitelist, cvScore, sendResponse) {
	chrome.storage.local.get('authToken', result => {
		if (result.authToken) {
			fetch(`${apiUrl}/sites/new_query`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${result.authToken}`
				},
				body: JSON.stringify({ canonicalUrl, submittedURLCopy, isInSubscribedWhitelist, cvScore })
			})
				.then(res => res.json())
				.then(data => {
					// Ensure the sendResponse is correctly invoked
					return { success: data.success, message: data.message };
				})
				.catch(error => {
					// Handle errors properly
					return { success: false, message: error };
				});
		} else {
			// Handle case when no authToken is found
			return { success: false, message: 'Not authenticated' };
		}
	});

	// Returning true to indicate asynchronous response will be sent later
	return true;
}

//*----------RegisterPage -------- PUBLIC ---------------//
//* 0) register handler
function handleRegistration(user_info) {
	return fetch(`${apiUrl}/user/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user_info)
	})
		.then(res => res.json())
		.then(data => {
			return { success: data.success, message: data.message };
		});
}
//* GET admins
function fetchAdmins(sendResponse) {
	fetch(`${apiUrl}/user/admin-list`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
		.then(res => (res.ok ? res.json() : Promise.reject(new Error('Network response was not ok'))))
		.then(data =>
			data.success
				? sendResponse({ success: true, admins: data.admins })
				: sendResponse({ success: false, message: data.message })
		)
		.catch(error => sendResponse({ success: false, message: error.message }));
}
//* GET admin's Whitelists
function fetchAdminsWhitelists(adminName, sendResponse) {
	fetch(`${apiUrl}/user/adminsWhitelists?adminName=${encodeURIComponent(adminName)}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				sendResponse({ success: true, whitelists: data.whitelists });
			} else {
				sendResponse({ success: false, message: 'Failed to fetch whitelists' });
			}
		})
		.catch(error => {
			sendResponse({ success: false, message: error.message });
		});
}
