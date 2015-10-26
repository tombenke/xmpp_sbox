#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var rebels = require('./testParameters').rebels;
var empire = require('./testParameters').empire;

var debug = false;
  
describe('stanza.io admin#add-user workflow', function () {

    var rebelsAdmin, sessionid;

    it('Admin should add new user to rebels', function (done) {
        this.timeout(10000);

        async.series([

            function (cb) {
                rebelsAdmin = XMPP.createClient({
                    jid:       rebels().rebelsAdmin.jid,
                    password:  rebels().rebelsAdmin.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });
                rebelsAdmin.use(require('../libs/plugins/addUser'));
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
                        node: 'http://jabber.org/protocol/admin#add-user'
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

				var fields = {
					accountjid: {
						varName: 'accountjid',
						value: 'rebel.trooper@rebels'
					},
					password: {
						varName: 'password',
						value: 'pass123'
					},
					passwordVerify: {
						varName: 'password-verify',
						value: 'pass123'
					}
				};


                rebelsAdmin.once('iq', function (iq) {
                    rebels().rebelsAdmin.log('iq:result', iq);

                    iq.should.have.property('type', 'result');
                    iq.should.have.property('command');
                    iq.command.should.have.property('status', 'completed');

                    cb();
                });

                rebelsAdmin.registerUser(rebelsAdmin.jid, 'rebels', sessionid, fields);
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

