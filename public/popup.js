// public/popup.js
document.addEventListener('DOMContentLoaded', function () {
  // Elements retrieval
  const mainPage = document.getElementById('mainPage');
  const registerPage = document.getElementById('registerPage');
  const loginPage = document.getElementById('loginPage');
  const goToRegisterPage = document.getElementById('goToRegisterPage');
  const goToLoginPage = document.getElementById('goToLoginPage');

  // Navigation event listeners
  goToRegisterPage.addEventListener('click', function () {
    mainPage.classList.add('hidden');
    registerPage.classList.remove('hidden');
  });

  goToLoginPage.addEventListener('click', function () {
    mainPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registerForm'); // Corrected the ID here
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
