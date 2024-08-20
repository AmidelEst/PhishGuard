//------------------------------------------------------//
// public/js/domHandlers/validation.js
import { getElement } from './getElement.js';

// Helper function to hide all password feedback messages
const hideAllPasswordFeedback = () => {
	const feedbackIds = [
		'passwordLengthFeedback',
		'passwordLetterNumberFeedback',
		'passwordSpecialCharFeedback',
		'passwordNoSpaceEmojiFeedback'
	];
	feedbackIds.forEach(id => {
		getElement(id).style.display = 'none';
	});
};

// Password validation function
export const validatePassword = () => {
	const password = getElement('registerPassword').value.trim();
	hideAllPasswordFeedback();

	let isValid = true;

	// Validate password length (8-20 characters)
	if (password.length < 8 || password.length > 20) {
		getElement('passwordLengthFeedback').style.display = 'block';
		isValid = false;
	}

	// Validate password contains both letters and numbers
	if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
		getElement('passwordLetterNumberFeedback').style.display = 'block';
		isValid = false;
	}

	// Validate password contains at least one special character
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		getElement('passwordSpecialCharFeedback').style.display = 'block';
		isValid = false;
	}

	// Validate password does not contain spaces or emojis
	if (/\s/.test(password) || /[\uD800-\uDFFF]/.test(password)) {
		getElement('passwordNoSpaceEmojiFeedback').style.display = 'block';
		isValid = false;
	}

	return isValid;
};

export const validateUrlField = () => {
	const urlField = getElement('urlField');
	const urlValue = urlField.value.trim();

	// Check that the URL does not start with a dot
	if (urlValue.startsWith('.')) {
		urlField.classList.add('is-invalid');
		return false; // Validation failed
	}

	// Allow URLs with or without http/https
	const urlPattern = /^[\w-]+(\.[\w-]+)+([\w-./?%&=]*)?$/i;

	const isValid = urlPattern.test(urlValue);

	if (!isValid) {
		urlField.classList.add('is-invalid'); // Add Bootstrap invalid class
	} else {
		urlField.classList.remove('is-invalid'); // Remove invalid class if valid
		urlField.classList.add('is-valid'); // Optionally, add valid class
	}

	return isValid;
};

// Generic form field validator that accepts rules
export const validateField = (field, rules) => {
	let isValid = true;
	rules.forEach(rule => {
		if (!rule.check(field.value)) {
			field.classList.add('is-invalid');
			isValid = false;
		} else {
			field.classList.remove('is-invalid');
			field.classList.add('is-valid');
		}
	});
	return isValid;
};

// Example usage for email validation
export const validateEmailField = () => {
	const emailField = getElement('registerEmail');
	const emailValue = emailField.value.trim();

	// Basic email pattern validation
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const isValid = emailPattern.test(emailValue);

	if (!isValid) {
		emailField.classList.add('is-invalid');
	} else {
		emailField.classList.remove('is-invalid');
		emailField.classList.add('is-valid');
	}

	return isValid;
};
