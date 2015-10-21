var colors = require('colors/safe');
var YAML = require('yamljs');


module.exports.createLogger = function (name, opts) {
    return function (evt, msg) {

        console.log(
            colors.inverse(
                colors[opts.keysColor](name + "#" + evt)));
    
        for (var i = 1; i < arguments.length; i++) {
            console.log(
                colors[opts.keysColor](
                    YAML.stringify(
                        JSON.parse(
                            JSON.stringify(arguments[i])), 100, 2)));
        }
    }
}
