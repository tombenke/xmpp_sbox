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

                        if (stanza.presence.type) {

                            console.log('+++')
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
                    client2.sendSubscriptionAck('user01@clc');
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