// // content.js

// function formatDOM() {
// 	const allElements = [...document.querySelectorAll('*')].map((el) => ({
// 		tagName: el.tagName,
// 		attributes: Array.from(el.attributes, (attr) => ({
// 			name: attr.name,
// 			value: attr.value,
// 		})),
// 		textContent: el.textContent.trim(),
// 	}));
// 	console.log(allElements); // Example: Log the received data
// 	return allElements;
// }

// // Listen for a message from the service worker to capture the DOM
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// 	if (request.action === 'captureDOM') {
// 		const domContent = document.documentElement.innerHTML; // Capture the DOM
// 		const formattedDom = formatDOM(); // Convert DOM to a suitable format
// 		sendResponse({ formattedDom: formattedDom });
// 	}
// });
