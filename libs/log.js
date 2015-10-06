var prettyjson = require('prettyjson');
var colors = require('colors/safe');


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

module.exports.createLogger = function (name, opts) {
    return function (msg) {

        console.log(
            colors.inverse(
                colors[opts.keysColor](name)));
    
        for (var i = 0; i < arguments.length; i++)
            console.log(prettyjson.render(arguments[i], opts));

        console.log();

    }
}