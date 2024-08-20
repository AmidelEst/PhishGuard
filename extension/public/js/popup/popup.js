//-----------------------------------------------
// public/js/popup/popup.js
import { setupEventListeners } from '../helperFunctions/eventListeners.js';
import { checkUserSessionAndNavigate } from '../helperFunctions/sessionManager.js';

document.addEventListener('DOMContentLoaded', () => {
	// Set up event listeners for various interactions
	setupEventListeners();

	// Check the user session and navigate to the appropriate page
	checkUserSessionAndNavigate();
});
