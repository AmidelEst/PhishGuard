const Queries = require('../../models/queries');
// store certificate and link it to a monitored site
async function storeNewQuery(monitoredSite, submittedURLCopy, isInSubscribedWhitelist, cvScore) {
	console.log('🚀 ~ :', submittedURLCopy, isInSubscribedWhitelist, cvScore);
	try {
		console.log(`Storing Query for site: ${submittedURLCopy}`);
		console.log(isInSubscribedWhitelist ? 'Yes' : 'No');

		const query = new Queries({
			monitoredSites: monitoredSite._id,
			submittedUrl: submittedURLCopy,
			isInSubscribedWhitelist: isInSubscribedWhitelist ? 'Yes' : 'No',
			cvScore: cvScore ? 'Yes' : 'No'
		});
		await query.save();
		return;
	} catch (err) {
		process.stdout.write(`Error:`, err);
		throw err;
	}
}
module.exports = {
	storeNewQuery
};
