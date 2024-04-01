const apiUrl = 'http://localhost:3001'; // Placeholder, replace with environment-specific URL

chrome.runtime.onInstalled.addListener((details) => {
	console.log('onInstalled reason:', details.reason);
});

chrome.runtime.onMessage.addListener((data) => {
	const { event, prefs } = data;
	switch (event) {
		case 'onStop':
			handleOnStop();
			break;
		case 'OnStart':
			handleOnStart(prefs);
			break;
		case 'login':
			handleOnStart();
			break;
	}
	return true; // Indicate that we're asynchronously handling the message
});

const handleLogin = () => {
	// Assuming message contains {token: "USER_TOKEN"}
	chrome.storage.local.set({ token: message.token }, function () {
		console.log('User token saved');
		// You can perform additional actions upon successful login
	});
};
const handleLogout = () => {
	// Handle logout
	chrome.storage.local.remove('token', function () {
		console.log('User logged out');
		// Perform cleanup or reset state as necessary
	});
};

const handleOnStart = () => {
	console.log('On start in background');
	console.log('prefs received:', prefs);
	chrome.storage.local.set(prefs);
};
const handleOnStop = () => {
	console.log('On stop in background');
};

// Example: Perform a background task
function checkForUpdates() {
	chrome.storage.local.get(['token'], function (result) {
		if (result.token) {
			console.log('checkForUpdates -> Token found:', result.token);
			// Use the token to perform authenticated actions, e.g., fetch data from a server
			// fetch('https://yourserver.com/api/check', {headers: {'Authorization': `Bearer ${result.token}`}})
			//     .then(response => response.json())
			//     .then(data => console.log(data));
		} else {
			console.log('No token found, user not logged in.');
		}
	});
}

// Call `checkForUpdates` periodically, adjust interval as needed
setInterval(checkForUpdates, 60000); // 60 seconds as an example
