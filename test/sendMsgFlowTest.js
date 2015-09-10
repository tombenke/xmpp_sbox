#!/usr/bin/env node
'use strict';

var XmppClient = require('../lib/XmppClient');
var c = XmppClient.constants;
var should = require('should');
var async = require('async');
var parseString = require('xml2js').parseString;
var users = require('../test/testParameters').users;

var counter = 1;

describe('XmppClient messaging workflow', function () {
    it('clients should send messages to each other', function (done) {
        this.timeout(3000);

        var han, chewie;

        async.series([
            // Han Solo goes online
            function (cb) {
                han = new XmppClient(users().Han_Solo);
                han.connect(function () {
                    cb();
                });
            },
            // Han Solo announces presence
            function (cb) {                    
                han.presence(c.presence.CHAT, 'I\'m here.', function () {
                    cb();
                });
            },
            // Chewbacca goes online
            function (cb) {
                chewie = new XmppClient(users().Chewie, 100);
                chewie.connect(function () {
                    cb();
                })
            },
            // Chewbacca announces presence
            function (cb) {
                chewie.presence(c.presence.CHAT, 'Rrrrrrr-ghghghghgh!', function () {
                    cb();
                });
            },
            // Han sends subscription request to Chewie
            function (cb) {
                han.subscription(c.subscription.REQUEST, users().Chewie.jid, function () {
                    cb();
                });
            },
            // Chewie approves Han's subscription request
            function (cb) {
                chewie.subscription(c.subscription.APPROVE, users().Han_Solo.jid, function () {
                    cb();
                })
            },
            /*// Chewie sends subscription request to Han, Han approves
            function (cb) {
                var msgId = counter++ + '';
                han.on('presence', function (xml) {
                    parseString(xml, function (err, stanza) {
                        if (stanza.presence.$.id === msgId) {
                            cb();
                        }
                    });
                });

                chewie.sendSubscriptionReq(users().Han_Solo.jid, msgId);
            },
            // Han approves Chewie's subscription request
            function (cb) {
                var msgId = counter++ + '';
                chewie.on('presence', function (xml) {
                    parseString(xml, function (err, stanza) {
                        if (stanza.presence.$.id === msgId) {
                            cb();
                        }
                    });
                });
                            
                han.sendSubscriptionApp(users().Chewie.jid);
            },
            //
            function (cb) {
                var msgId = counter++ + '';
                han.on('iq', function (xml) {
                    parseString(xml, function (err, stanza) {
                        if (stanza.iq.$.id === msgId) {
                            cb();
                        }
                    });
                });

                han.sendRosterGet(msgId);
            },*/
            // Han removes Chewie from roster and subscription
            function (cb) {
                han.remove(users().Chewie.jid, 2);
            },
            // Chewie removes Han from roster and subscription
            function (cb) {
                chewie.remove(users().Han_Solo.jid, 3);
            },
            // Test end
            function () {
                han.disconnect();
                chewie.disconnect();
                done();
            }
        ]);
        
    });
});

function extractJid(str) {
    return str.split('/')[0];
}