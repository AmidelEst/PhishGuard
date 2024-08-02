function showInPageNotification(message) {
	const notificationDiv = document.createElement('div');
	notificationDiv.textContent = message;
	notificationDiv.style.position = 'fixed';
	notificationDiv.style.bottom = '10px';
	notificationDiv.style.right = '10px';
	notificationDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
	notificationDiv.style.color = 'white';
	notificationDiv.style.padding = '10px';
	notificationDiv.style.borderRadius = '5px';
	document.body.appendChild(notificationDiv);

	setTimeout(() => {
		notificationDiv.remove();
	}, 3000);
}

// Example usage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.message === 'showNotification') {
		showInPageNotification(request.payload);
	}
});
