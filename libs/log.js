var prettyjson = require('prettyjson');

module.exports = function log(options, logEntry) {
	console.log(prettyjson.render(logEntry, options));
};