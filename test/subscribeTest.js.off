#!/usr/bin/env node
'use strict';

var XmppClient = require('../lib/XmppClient');
var should = require('should');
var async = require('async');
var parseString = require('xml2js').parseString;


describe('XmppClient', function () {
    it('should send subscription', function (done) {
        var client1, client2;

        async.series([
            function (cb) {
                client1 = new XmppClient({
                    jid:      'user01@clc',
                    password: 'pass01',
                    host:     'localhost'
                });

                client1.on('online', function () {
                    client1.sendPresence('chat', 'available');
                    cb();
                });

                client1.on('presence', function (xml) {
                    parseString(xml, function (err, stanza) {

                        if (stanza.presence.$.from.split('/')[0] === 'user02@clc') {

                            stanza.should.have.property('presence');

                            stanza.presence.$.should.have.property('to');
                            stanza.presence.$.to.split('/')[0].should.be.eql('user01@clc');

                            stanza.presence.$.should.have.property('from');
                            stanza.presence.$.from.split('/')[0].should.be.eql('user02@clc');

                            stanza.presence.should.have.property('show');
                            stanza.presence.show[0].should.be.eql('chat');

                            stanza.presence.should.have.property('status');
                            stanza.presence.status[0].should.be.eql('available');

                            client1.disconnect();
                            client2.disconnect();
                            done();
                        }

                    });
                });
            },
            function (cb) {

                client2 = new XmppClient({
                    jid:      'user02@clc',
                    password: 'pass02',
                    host:     'localhost'
                });

                client2.on('presence', function (xml) {
                    client2.sendSubscriptionApp('user01@clc');
                })

                client2.on('online', function () {
                    client2.sendPresence('chat', 'available');
                    cb();
                });


            },
            function (cb) {
                client1.sendSubscriptionReq('user02@clc');
                cb();
            }
        ]);
        
    });
});