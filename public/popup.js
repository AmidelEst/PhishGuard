// /public/popup.js
// Immediately Invoked Function Expression (IIFE) to avoid polluting the global scope
(function () {
    // Function to show the notification
    function showNotification(message, success) {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        const backdrop = document.getElementById('backdrop');

        notificationMessage.innerText = message;
        notification.classList.remove('hidden', 'success', 'error');
        backdrop.classList.remove('hidden');

        if (success) {
            notification.classList.add('success');
        } else {
            notification.classList.add('error');
        }

        notification.style.display = 'block';
        backdrop.style.display = 'block';

        // Automatically hide the notification after 3 seconds
        setTimeout(closeNotification, 3000);
    }

    // Function to close the notification
    function closeNotification() {
        const notification = document.getElementById('notification');
        const backdrop = document.getElementById('backdrop');

        notification.classList.add('hidden');
        backdrop.classList.add('hidden');
    }

    // Add event listener to the close button
    document.addEventListener('DOMContentLoaded', function () {
        document
            .getElementById('close-notification-button')
            .addEventListener('click', closeNotification);
    });

    // Expose showNotification function to the global scope
    window.showNotification = showNotification;
})();


(function () {
	const registerPage = document.getElementById('registerPage');
	const sendUrlPage = document.getElementById('sendUrlPage');
	const loginPage = document.getElementById('loginPage');
	const mainPage = document.getElementById('mainPage');

	const goToMainPage = () => {
		registerPage.classList.add('hidden');
		sendUrlPage.classList.add('hidden');
		loginPage.classList.add('hidden');
		mainPage.classList.remove('hidden');
	};

	document.getElementById('goBackBtnFromRegister').addEventListener('click', goToMainPage);
	document.getElementById('goBackBtnFromLogin').addEventListener('click', goToMainPage);
})();


document.addEventListener('DOMContentLoaded', function () {
	// -----------Elements retrieval------------------//

	//------------Pages Binding------------------//
	const mainPage = document.getElementById('mainPage');
	const registerPage = document.getElementById('registerPage');
	const loginPage = document.getElementById('loginPage');
	const sendUrlPage = document.getElementById('sendUrlPage');
	//------------Navigation buttons------------------------------------//

	//------------listeners to buttons in main page---//
	const goToRegister = document.getElementById('goToRegister');
	const goToLogin = document.getElementById('goToLogin');
	const logOutBtn = document.getElementById('logOutBtn');
	//------------Forms Binding------------------------------------//

	//------------listeners to *FORM's* submit button-//
	const registerForm = document.getElementById('registerForm'); //listens to *register* submit button
	const loginForm = document.getElementById('loginForm'); //listens to *register* submit button
	const sendUrlForm = document.getElementById('sendUrlForm');
	//---------------------------------------------------//

	//--------------assign functionalities to buttons-------------//

	const disableElement = (elem) => {
		elem.disabled = true;
	};
	const enableElement = (elem) => {
		elem.disabled = false;
	};

	//mainPage -> Registration
	goToRegister.addEventListener('click', function () {
		mainPage.classList.add('hidden');
		registerPage.classList.remove('hidden');
	});

	//mainPage -> LoginPage
	goToLogin.addEventListener('click', function () {
		mainPage.classList.add('hidden');
		loginPage.classList.remove('hidden');
	});

	//any -> mainPage -> Registration
	const goToMainPage = () => {
		registerPage.classList.add('hidden');
		sendUrlPage.classList.add('hidden');
		loginPage.classList.add('hidden');
		mainPage.classList.remove('hidden');
	};
	//any -> Send Url Page
	const goToSendUrlPage = () => {
		loginPage.classList.add('hidden');
		mainPage.classList.add('hidden');
		registerPage.classList.add('hidden');
		sendUrlPage.classList.remove('hidden');
	};

	//-----------------!end of HTML Basic binding!-------------------------------//

	// 0) clicking on our extension icon
	chrome.runtime.sendMessage({ event: 'onStart' }, function (response) {
		if (response && response.success) {
			goToSendUrlPage();
			// Retrieve the saved URL when the popup is opened
			chrome.storage.local.get('savedUrl', function (result) {
				if (result.savedUrl) {
					urlField.value = result.savedUrl;
				}
			});
		} else {
			goToMainPage();
		}
	});

	// 1) Register event listener
	if (registerForm) {
		registerForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const registerEmail = document.getElementById('registerEmail').value;
			const registerPassword = document.getElementById('registerPassword').value;
			const confirmPassword = document.getElementById('confirmPassword').value;

			if (registerPassword !== confirmPassword) {
				showNotification('Passwords do not match.',false);
				return;
			} // send flag message
			chrome.runtime.sendMessage(
				{
					message: 'register',
					payload: {
						email: registerEmail,
						password: registerPassword,
					}, // Pass the email and password
				}, // returns from background & user
				function (response) {
					if (response && response.success) {
						showNotification('Registration Successful',true);
						goToMainPage();
					} else {
						showNotification(`Registration Failed: ${response.message}`,false);
					}
				}
			);
		});
	}

	// 2) Login event listener
	if (loginForm) {
		loginForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const loginEmail = document.getElementById('loginEmail').value;
			const loginPassword = document.getElementById('loginPassword').value;
			chrome.runtime.sendMessage(
				{
					message: 'login',
					payload: {
						email: loginEmail,
						password: loginPassword,
					}, // Pass the email and password
				},
				function (response) {
					if (response && response.success) {
						showNotification('login Successful',true);
						goToSendUrlPage();
					} else {
						showNotification(`login Failed: ${response.message}`,false);
					}
				}
			);
		});
	}

	// 3) get url to check
	// Save the URL whenever it changes
	urlField.addEventListener('input', function () {
		chrome.storage.local.set({ savedUrl: urlField.value });
	});
	sendUrlForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const urlAddress = document.getElementById('urlField').value;
		console.log('site to seek: ' + urlAddress);
		chrome.runtime.sendMessage(
			{
				message: 'checkUrl',
				payload: {
					url: urlAddress,
				},
			},
			function (response) {
				console.log(response); // Check what you're actually receiving
				if (response && response.success) {
					showNotification('checkUrl Successful',true);
				} else {
					showNotification(`${response.message}`,false);
				}
			}
		);
	});

	// 4) logOut event listener
	logOutBtn.addEventListener('click', () => {
		chrome.runtime.sendMessage({ message: 'logOut' }, function (response) {
			if (response && response.success) {
				showNotification('Logout Successful',true);
				goToMainPage();
			} else {
				// This will now properly display the message from the background script, if any
				showNotification(`Logout Failed: ${response.message}`,false);
			}
		});
	});
});
