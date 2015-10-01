var prettyjson = require('prettyjson');

module.exports = function log(data, options) {
	console.log(prettyjson.render(data, options) + '\n');	
};