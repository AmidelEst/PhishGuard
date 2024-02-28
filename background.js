chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    // Initialize extension state, if necessary
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.event === 'login') {
        // Handle login
        // Assuming message contains {token: "USER_TOKEN"}
        chrome.storage.local.set({token: message.token}, function() {
            console.log('User token saved');
            // You can perform additional actions upon successful login
        });
    } else if (message.event === 'logout') {
        // Handle logout
        chrome.storage.local.remove('token', function() {
            console.log('User logged out');
            // Perform cleanup or reset state as necessary
        });
    }
    return true; // Indicate that we're asynchronously handling the message
});

// Example: Perform a background task
function checkForUpdates() {
    chrome.storage.local.get(['token'], function(result) {
        if (result.token) {
            console.log('Token found:', result.token);
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
