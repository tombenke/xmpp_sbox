var parseString = require('xml2js').parseString;
var _ = require('lodash');


module.exports.getContactsFromRoster = function(json, cb) {
    var result = [],
        items  = _.get(json, ['iq', 'query', '0', 'item']);
    if (items) {
        _.forEach(items, function (item) {
            var contact = _.get(item, ['$', 'jid']);
            if (contact) {
                result.push(contact);
            }
        });
    }
    return result;
}