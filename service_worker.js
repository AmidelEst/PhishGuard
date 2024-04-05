// service_worker.js
const apiUrl = 'http://localhost:3001';
// Example of a function in background.js to handle a POST request
async function postData(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors', // Ensure CORS mode is set if making requests to other origins
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json',
		},
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
		body: JSON.stringify(data),
	});
	return response.json(); // Parses JSON response into native JavaScript objects
}

// Listen for messages from popup.js or content scripts
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.contentScriptQuery == 'fetchUrl') {
		postData(request.url, request.data)
			.then((response) => sendResponse(response))
			.catch((error) => console.error('Error:', error));
		return true; // Will respond asynchronously
	}
});
