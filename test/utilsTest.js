var utils = require('../lib/Utils');
var should = require('should');


describe('Utils getContactsFromRoster', function () {
    it('should return a list of users from roster', function () {

        /*
        var xml = "<iq id='bv1bs71f' to='juliet@example.com/chamber' type='result'><query xmlns='jabber:iq:roster' ver='ver7'><item jid='nurse@example.com'/><item jid='romeo@example.net'/></query></iq>"
        */

        var json = 
        {
            iq: {
                '$': {
                    id:'bv1bs71f',
                    to:'juliet@example.com/chamber',
                    type:'result'
                },
            query: [{
                    '$': {
                    xmlns:'jabber:iq:roster',
                    ver:'ver7'
                    },
                    item:[
                        { '$':{ jid:'nurse@example.com' } },
                        { '$':{ jid:'romeo@example.net' } }
                    ]
                }]
            }
        };

        utils.getContactsFromRoster(json).should.be.eql(['nurse@example.com', 'romeo@example.net']);
    });
});