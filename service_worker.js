// // service_worker.js

// Listening for updates to any tab that meets the defined conditions
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
// 	// Ensuring that the tab has completed loading
// 	// Logging the URL of the updated tab
// 	console.log(`Updated tab ${tabId} URL:`, tab.url);
// });

chrome.webRequest.onBeforeRequest.addListener(
	function (details) {
		// Check if the request is associated with a tab
		if (details.tabId > 0) {
			chrome.tabs.get(details.tabId, function (tab) {
				// Now you have access to the tab's details, including its URL
				console.log(tab.url); // Log the URL of the updating tab

				// If you need to return this URL from the function, you'll have to use message passing
				// or another asynchronous pattern since chrome.tabs.get is asynchronous
			});
		}
	},
	{ urls: ['<all_urls>'] }, // Filter to listen to all URLs
	[] // No extraInfoSpec needed for this task
);
