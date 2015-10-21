#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var rebels = require('./testParameters').rebels;


var debug = false;

describe('XMPP multi-user chat message history', function () {

    var han, chewie, r2d2, leia;

    it('clients should see message history after joining to a room', function (done) {
        this.timeout(3000);

        async.series([

            function (cb) {
                chewie = XMPP.createClient({
                    jid:       rebels().chewie.jid,
                    password:  rebels().chewie.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                han = XMPP.createClient({
                    jid:        rebels().han.jid,
                    password:   rebels().han.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                r2d2 = XMPP.createClient({
                    jid:        rebels().r2d2.jid,
                    password:   rebels().r2d2.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                leia = XMPP.createClient({
                    jid:        rebels().leia.jid,
                    password:   rebels().leia.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });
              
                cb();
            },

            function (cb) {
                if (debug === true) {
                    chewie.on('*', function (name, data) {
                        console.dir(data);
                    });
                    han.on('*', function (name, data) {
                        console.dir(data);
                    });
                    r2d2.on('*', function (name, data) {
                        console.dir(data);
                    });
                    leia.on('*', function (name, data) {
                        console.dir(data);
                    });
                }
                cb();
            },

            function (cb) {
                chewie.once('session:started', function (data) {
                    rebels().chewie.log('session:started', data);
                    cb();
                });
                chewie.connect();
            },

            function (cb) {
                chewie.once('presence', function (data) {
                    rebels().chewie.log('presence', data);
                    cb();
                });
                chewie.sendPresence({});
            },

            function (cb) {
                han.once('session:started', function (data) {
                    rebels().han.log('session:started', data);
                    cb();
                });
                han.connect();
            },

            function (cb) {
                han.once('presence', function (data) {
                    rebels().han.log('presence', data);
                    cb();
                });
                han.sendPresence({});
            },

            function (cb) {
                r2d2.once('session:started', function (data) {
                    rebels().r2d2.log('session:started', data);
                    cb();
                });
                r2d2.connect();
            },

            function (cb) {
                r2d2.once('presence', function (data) {
                    rebels().r2d2.log('presence', data);
                    cb();
                });
                r2d2.sendPresence({});
            },

            function (cb) {
                leia.once('session:started', function (data) {
                    rebels().leia.log('session:started', data);
                    cb();
                });
                leia.connect();
            },

            function (cb) {
                leia.once('presence', function (data) {
                    rebels().leia.log('presence', data);
                    cb();
                });
                leia.sendPresence({});
            },

            function (cb) {
                chewie.once('muc:join', function (data) {
                    rebels().chewie.log('muc:join', data);
                    cb();
                });
            	chewie.joinRoom('example@conference.rebels', 'Chewie');
            },

            function (cb) {
                han.once('muc:join', function (data) {
                    rebels().han.log('muc:join', data);
                    cb();
                });
                han.joinRoom('example@conference.rebels', 'Han');
            },

            function (cb) {
                r2d2.once('muc:join', function (data) {
                    rebels().r2d2.log('muc:join', data);
                    cb();
                });
                r2d2.joinRoom('example@conference.rebels', 'R2');
            },

            function (cb) {
                chewie.once('message', function (msg) {
                    rebels().chewie.log('message', msg);
                    cb();
                });

                han.sendMessage({
                    to: 'example@conference.rebels',
                    body: 'Anybody there?',
                    type: 'groupchat'
                });
            },

            function (cb) {
                han.once('message', function (msg) {
                    rebels().han.log('message', msg);
                    cb();
                });
                chewie.sendMessage({
                    to: 'example@conference.rebels',
                    body: 'Rrrrrrr-ghghghghgh!',
                    type: 'groupchat'
                });
            },

            function (cb) {
                r2d2.once('message', function (msg) {
                    rebels().r2d2.log('message', msg);
                    cb();
                });
                r2d2.sendMessage({
                    to: 'example@conference.rebels',
                    body: 'beep-beep',
                    type: 'groupchat'
                });
            },

            function (cb) {
                han.once('muc:leave', function (data) {
                    rebels().chewie.log('muc:leave', data);
                    cb();
                });
            	han.leaveRoom('example@conference.rebels', 'Han');
            },

            function (cb) {
                r2d2.once('muc:leave', function (data) {
                    rebels().r2d2.log('muc:leave', data);
                    cb();
                });
                r2d2.leaveRoom('example@conference.rebels', 'R2');
            },

            function (cb) {
                leia.on('message', function (msg) {
                    rebels().leia.log('message', msg);
                    
                    msg.should.have.property('delay');
                    msg.should.have.property('to');
                    msg.to.bare.should.equal(rebels().leia.jid);
                    msg.should.have.property('body');
                    
                });

                leia.once('muc:join', function (data) {
                    rebels().leia.log('muc:join', data);
                    cb();
                });

                leia.joinRoom('example@conference.rebels', 'Leia');
            },

            function (cb) {
                leia.once('muc:leave', function (data) {
                    rebels().leia.log('muc:leave', data);
                    cb();
                });

                leia.leaveRoom('example@conference.rebels', 'Leia');
            },

            function (cb) {
                chewie.once('muc:leave', function (data) {
                    rebels().chewie.log('muc:leave', data);
                    cb();
                });

                chewie.leaveRoom('example@conference.rebels', 'Chewie');
            },

            function () {
                done();
            }
        ]);
    });

    after(function() {
        chewie.disconnect();
        han.disconnect();
        r2d2.disconnect();
        leia.disconnect();
    });
    
});

