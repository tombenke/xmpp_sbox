#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var rebels = require('./testParameters').rebels;
var empire = require('./testParameters').empire;

var debug = false;
  
describe('stanza.io messaging workflow', function () {

    var rebelsAdmin, sessionid;

    it('Clients should connect and send messages to each other', function (done) {
        this.timeout(10000);

        async.series([

            function (cb) {
                rebelsAdmin = XMPP.createClient({
                    jid:       rebels().rebelsAdmin.jid,
                    password:  rebels().rebelsAdmin.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });
                rebelsAdmin.use(require('../libs/plugins/delUser'));
                cb();
            },

            function (cb) {
                if (debug === true) {
                    rebelsAdmin.on('*', function (name, data) {
                        rebels().rebelsAdmin.log(name);
                        console.dir(data);
                    });
                }
                cb();
            },

            function (cb) {
                rebelsAdmin.once('session:started', function (data) {
                    rebels().rebelsAdmin.log('session:started', data);
                    cb();
                });

                rebelsAdmin.connect();
            },

            function (cb) {
                rebelsAdmin.once('presence', function (data) {
                    rebels().rebelsAdmin.log('presence', data);
                    cb();
                });
                rebelsAdmin.sendPresence({});
            },

            function (cb) {
                var item = {
                    from: rebels().rebelsAdmin.jid,
                    to: 'rebels',
                    type: 'set',
                    command: {
                        xmlns: 'http://jabber.org/protocol/commands',
                        action: 'execute',
                        node: 'http://jabber.org/protocol/admin#delete-user'
                    }
                };
                rebelsAdmin.sendIq(item, function (err, iq) {
                    rebels().rebelsAdmin.log('iq:form', iq);

                    iq.should.have.property('type', 'result');
                    iq.should.have.property('command');
                    iq.command.should.have.property('form');
                    iq.command.should.have.property('sessionid');
                    iq.command.should.have.property('status', 'executing');

                    sessionid = iq.command.sessionid;
                    cb();
                });
            },

            function (cb) {
                rebelsAdmin.once('iq', function (iq) {
                    rebels().rebelsAdmin.log('iq:result', iq);

                    iq.should.have.property('type', 'result');
                    iq.should.have.property('command');
                    iq.command.should.have.property('status', 'completed');

                    cb();
                });
                rebelsAdmin.unregisterUser(rebelsAdmin.jid, 'rebels', sessionid, 'rebel.trooper@rebels');
            },

            function () {
                done();
            }
        ]);
    });

    after(function() {
        rebelsAdmin.disconnect();
    });
    
});

