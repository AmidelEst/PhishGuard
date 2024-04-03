// // service_worker.js
const apiUrl = 'http://localhost:3001';
const requestCache = {};
const THROTTLE_TIME = 60000; // 1 minute

chrome.webRequest.onBeforeRequest.addListener(
	function (details) {
		if (details.tabId > 0) {
			chrome.tabs.get(details.tabId, function (tab) {
				// Ensure URL is present
				if (tab.url) {
					const now = Date.now();
					const lastRequestTime = requestCache[tab.url] || 0;

					// Check if the current request is within the throttle time
					if (now - lastRequestTime > THROTTLE_TIME) {
						console.log(tab.url); // Log the URL of the updating tab

						// Update the last request time
						requestCache[tab.url] = now;

						// Define your server endpoint
						const serverEndpoint = `${apiUrl}/url/input`;

						// Use Fetch API to send the URL to your server
						fetch(serverEndpoint, {
							method: 'POST', // or 'GET', depending on how your server is set up
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({ url: tab.url }),
						})
							.then((response) => response.json()) // Assuming server responds with JSON
							.then((data) => console.log('Success:', data))
							.catch((error) => console.error('Error:', error));
					} else {
						console.log(`Request for ${tab.url} is throttled.`);
					}
				}
			});
		}
	},
	{ urls: ['<all_urls>'] },
	[]
);
