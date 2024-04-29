// /public/popup.js
document.addEventListener('DOMContentLoaded', function () {
	// Elements retrieval

	//------------4 views of the app -----------------//
	const mainPage = document.getElementById('mainPage');
	const registerPage = document.getElementById('registerPage');
	const loginPage = document.getElementById('loginPage');
	const sendUrlPage = document.getElementById('sendUrlPage');
	//------------------------------------------------//

	//--------------listeners to buttons in main page--------------//
	const goToRegister = document.getElementById('goToRegister');
	const goToLogin = document.getElementById('goToLogin');
	//---------------------------------------------------//

	//--------------listeners to *FORM's* submit button--------------//
	const registerForm = document.getElementById('registerForm'); //listens to *register* submit button
	const loginForm = document.getElementById('loginForm'); //listens to *register* submit button
	const urlForm = document.getElementById('sendUrl');
	//---------------------------------------------------//

	const logOut = document.getElementById('logOut');
	const apiUrl = 'http://localhost:3001';

	//--------------assign functionalities to the 2 buttons on of main page-------------//

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
	//-----------------------------------------------//
	//mainPage -> Registration
	const goToMainPage = () => {
		registerPage.classList.add('hidden');
		sendUrlPage.classList.add('hidden');
		mainPage.classList.remove('hidden');
	};
	//any  -> Send Url Page
	const goToSendUrlPage = () => {
		loginPage.classList.add('hidden');
		mainPage.classList.add('hidden');
		sendUrlPage.classList.remove('hidden');
	};
	//-----------------!end of HTML Basic binding!-------------------------------//

	// 0) clicking on our extension icon
	chrome.runtime.sendMessage({ event: 'onStart' }, function (response) {
		if (response && response.success) {
			goToSendUrlPage();
		} else {
			goToMainPage();
		}
	});

	// 1) Register event listener
	if (registerForm) {
		registerForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const registerEmail =
				document.getElementById('registerEmail').value;
			const registerPassword =
				document.getElementById('registerPassword').value;
			const confirmPassword =
				document.getElementById('confirmPassword').value;

			if (registerPassword !== confirmPassword) {
				alert('Passwords do not match.');
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
						alert('Registration Successful');
						goToMainPage();
					} else {
						alert(`Registration Failed: ${response.message}`);
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
			const loginPassword =
				document.getElementById('loginPassword').value;
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
						alert('login Successful');
						goToSendUrlPage();
					} else {
						alert(`login Failed: ${response.message}`);
					}
				}
			);
		});
	}

	// 3) logOut event listener
	logOut.addEventListener('click', () => {
		chrome.runtime.sendMessage({ message: 'logOut' }, function (response) {
			if (response && response.success) {
				alert('Logout Successful');
				goToMainPage();
			} else {
				// This will now properly display the message from the background script, if any
				alert(`Logout Failed: ${response.message}`);
			}
		});
	});

	// 4) get url to check
	urlForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const urlAddress = document.getElementById('url').value;
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
					alert('checkUrl Successful');
				} else {
					alert(
						'checkUrl Failed: No response from server or unexpected response format.'
					);
				}
			}
		);
	});
});
