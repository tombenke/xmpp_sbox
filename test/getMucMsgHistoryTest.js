#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var logger = require('../libs/log');

var debug = false;

var users = {
    han: {
        jid:      'han.solo@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('han.solo', { keysColor: 'cyan' })
    },
    chewie: {
        jid:      'chewbacca@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('chewbacca', { keysColor: 'yellow' })
    },
    r2d2: {
        jid:      'r2d2@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('r2d2', { keysColor: 'green' })
    },
    leia: {
        jid:      'leia.organa@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('leia', { keysColor: 'magenta' })
    }
};
  
describe('stanza.io messaging workflow', function () {

    var han, chewie, r2d2, leia;

    it('Clients should connect and send messages to each other', function (done) {
        this.timeout(10000);

        async.series([

            function (cb) {
                chewie = XMPP.createClient({
                    jid:       users.chewie.jid,
                    password:  users.chewie.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                han = XMPP.createClient({
                    jid:        users.han.jid,
                    password:   users.han.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                r2d2 = XMPP.createClient({
                    jid:        users.r2d2.jid,
                    password:   users.r2d2.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                leia = XMPP.createClient({
                    jid:        users.leia.jid,
                    password:   users.leia.password,
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
                    users.chewie.log('session:started', data);
                    cb();
                });
                chewie.connect();
            },

            function (cb) {
                chewie.once('presence', function (data) {
                    users.chewie.log('presence', data);
                    cb();
                });
                chewie.sendPresence({});
            },

            function (cb) {
                han.once('session:started', function (data) {
                    users.han.log('session:started', data);
                    cb();
                });
                han.connect();
            },

            function (cb) {
                han.once('presence', function (data) {
                    users.han.log('presence', data);
                    cb();
                });
                han.sendPresence({});
            },

            function (cb) {
                r2d2.once('session:started', function (data) {
                    users.r2d2.log('session:started', data);
                    cb();
                });
                r2d2.connect();
            },

            function (cb) {
                r2d2.once('presence', function (data) {
                    users.r2d2.log('presence', data);
                    cb();
                });
                r2d2.sendPresence({});
            },

            function (cb) {
                leia.once('session:started', function (data) {
                    users.leia.log('session:started', data);
                    cb();
                });
                leia.connect();
            },

            function (cb) {
                leia.once('presence', function (data) {
                    users.leia.log('presence', data);
                    cb();
                });
                leia.sendPresence({});
            },

            function (cb) {
                chewie.once('muc:join', function (data) {
                    users.chewie.log('muc:join');
                    console.log(data);
                    cb();
                });
            	chewie.joinRoom('example@conference.rebels', 'Chewie');
            },

            function (cb) {
                han.once('muc:join', function (data) {
                    users.han.log('muc:join');
                    console.log(data);
                    cb();
                });
                han.joinRoom('example@conference.rebels', 'Han');
            },

            function (cb) {
                r2d2.once('muc:join', function (data) {
                    users.r2d2.log('muc:join');
                    console.log(data);
                    cb();
                });
                r2d2.joinRoom('example@conference.rebels', 'R2');
            },

            function (cb) {
                chewie.once('message', function (msg) {
                    users.chewie.log('message', msg);
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
                    users.han.log('message', msg);
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
                    users.r2d2.log('message', msg);
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
                    users.chewie.log('muc:leave');
                    console.log(data);
                    cb();
                });
            	han.leaveRoom('example@conference.rebels', 'Han');
            },

            function (cb) {
                r2d2.once('muc:leave', function (data) {
                    users.r2d2.log('muc:leave');
                    console.log(data);
                    cb();
                });
                r2d2.leaveRoom('example@conference.rebels', 'R2');
            },

            function (cb) {
                leia.on('message', function (msg) {
                    users.leia.log('message', msg);
                    
                    msg.should.have.property('delay');
                    msg.should.have.property('to');
                    msg.to.bare.should.equal(users.leia.jid);
                    msg.should.have.property('body');
                    
                });

                leia.once('muc:join', function (data) {
                    users.leia.log('muc:join');
                    console.log(data);
                    cb();
                });

                leia.joinRoom('example@conference.rebels', 'Leia');
            },

            function (cb) {
                leia.once('muc:leave', function (data) {
                    users.leia.log('muc:leave');
                    console.log(data);
                    cb();
                });

                leia.leaveRoom('example@conference.rebels', 'Leia');
            },

            function (cb) {
                chewie.once('muc:leave', function (data) {
                    users.chewie.log('muc:leave');
                    console.log(data);
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

