//  public/js/domHandlers/validation.js
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
