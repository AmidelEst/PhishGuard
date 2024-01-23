// popup.js
document.addEventListener('DOMContentLoaded', function () {
  // Get buttons and container divs
  const mainPage = document.getElementById('mainPage');
  const signUpPage = document.getElementById('signUpPage');
  const logInPage = document.getElementById('logInPage');
  const signUpButton = document.getElementById('signUpButton');
  const logInButton = document.getElementById('logInButton');

  // Event listener for Sign Up button
  signUpButton.addEventListener('click', function () {
    mainPage.classList.add('hidden');
    signUpPage.classList.remove('hidden');
  });

  // Event listener for Sign In button
  logInButton.addEventListener('click', function () {
    mainPage.classList.add('hidden');
    logInPage.classList.remove('hidden');
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('signupForm'); // Corrected the ID here
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value; // Changed from 'username' to 'name'
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      fetch('http://localhost:3000/user/create', {
        // Ensure this points to your server's URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }), // Ensure these keys match your backend's expected format
      })
        .then((response) => response.text())
        .then((data) => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  } else {
    console.error('Form element not found!');
  }
});
