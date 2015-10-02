var prettyjson = require('prettyjson');

module.exports = function log() {

	var logEntry;

	for (var i = 1; i < arguments.length; i++) {

		if (i === 1) {
			logEntry = {logEntry: JSON.stringify(arguments[i])};
			console.log(prettyjson.render(logEntry, arguments[0]));
		} else {
			console.log(arguments[i]);
		}

	};
	console.log('----------------------------');
};