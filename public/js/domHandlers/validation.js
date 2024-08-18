//------------------------------------------------------//
//  public/js/domBinding/validation.js
import { getElement } from './getElement.js';

const hideAllPasswordFeedback = () => {
	const feedbackIds = [
		'passwordLengthFeedback',
		'passwordLetterNumberFeedback',
		'passwordSpecialCharFeedback',
		'passwordNoSpaceEmojiFeedback',
	];
	feedbackIds.forEach((id) => (getElement(id).style.display = 'none'));
};
export const validatePassword = () => {
	const password = getElement('registerPassword').value;
	hideAllPasswordFeedback();

	if (password.length < 8 || password.length > 20) {
		getElement('passwordLengthFeedback').style.display = 'block';
	} else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
		getElement('passwordLetterNumberFeedback').style.display = 'block';
	} else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		getElement('passwordSpecialCharFeedback').style.display = 'block';
	} else if (/\s/.test(password) || /[\uD800-\uDFFF]/.test(password)) {
		getElement('passwordNoSpaceEmojiFeedback').style.display = 'block';
	}
};
export const validateUrlField = () => {
	const urlField = getElement('urlField');
	const urlValue = urlField.value.trim();

	// Regular expression to validate URL with or without http/https
	const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-./?%&=]*)?$/i;

	if (!urlPattern.test(urlValue)) {
		urlField.classList.add('is-invalid'); // Add Bootstrap invalid class
		return false; // Validation failed
	}

	urlField.classList.remove('is-invalid'); // Remove invalid class if valid
	urlField.classList.add('is-valid'); // Optionally, add valid class
	return true; // Validation passed
};
