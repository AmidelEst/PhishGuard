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
