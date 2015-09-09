#!/usr/bin/env node
'use strict';

var XmppClient = require('../lib/XmppClient');
var should = require('should');
var async = require('async');
var parseString = require('xml2js').parseString;
var users = require('../test/testParameters').users;

describe('XmppClient messaging workflow', function () {
    it('clients should send messages to each other', function (done) {

        var han, chewie;

        async.series([
            // Han Solo goes online
            function (cb) {
                han = new XmppClient(users().Han_Solo);

                han.on('online', function () {
                    han.sendPresence('chat', 'I\'m here.');
                    cb();
                });
            },
            // Chewbacca goes online
            function (cb) {
                chewie = new XmppClient(users().Chewie);

                chewie.on('online', function () {
                    chewie.sendPresence('chat', 'Rrrrrrr-ghghghghgh!');
                    cb();
                });
            },
            // Han sends subscription request to Chewie, Chewie approves
            function (cb) {
                chewie.on('presence', function (xml) {
                    parseString(xml, function (err, stanza) {
                        if (stanza.presence.$.type === 'subscribe' && extractJid(stanza.presence.$.from) === users().Han_Solo.jid) {
                            chewie.sendSubscriptionApp(users().Han_Solo.jid);
                            cb();
                        }
                    });
                });

                han.sendSubscriptionReq(users().Chewie.jid);
            },
            // Chewie sends subscription request to Han, Han approves
            function (cb) {
                han.on('presence', function (xml) {
                    parseString(xml, function (err, stanza) {
                        if (stanza.presence.$.type === 'subscribe' && extractJid(stanza.presence.$.from) === users().Chewie.jid) {
                            han.sendSubscriptionApp(users().Chewie.jid);
                            cb();
                        }
                    });
                });

                chewie.sendSubscriptionReq(users().Han_Solo.jid);
            },
            //
            function (cb) {
                han.on('iq', function (xml) {
                    parseString(xml, function (err, stanza) {
                        if (stanza.iq.$.id === '1') {
                            cb();
                        }
                    });
                });

                han.sendRosterGet('1');
            },
            // Han removes Chewie from roster and subscription
            function (cb) {
                han.on('iq', function (xml) {
                    parseString(xml, function (err, stanza) {
                        if (stanza.iq.$.id === '2') {
                            cb();
                        }
                    });
                });

                han.sendRemove(users().Chewie.jid, 2);
                
            },
            // Chewie removes Han from roster and subscription
            function (cb) {
                chewie.on('iq', function (xml) {
                    parseString(xml, function (err, stanza) {
                        if (stanza.iq.$.id === '3') {
                            cb();
                        }
                    });
                });

                chewie.sendRemove(users().Han_Solo.jid, 3);
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