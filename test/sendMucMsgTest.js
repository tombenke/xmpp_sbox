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
    }
};

describe('stanza.io messaging workflow', function () {

    var han, chewie, r2d2;

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
                han.once('muc:join', function (data) {
                    users.han.log('muc:join');
                    console.log(data);
                    cb();
                });
                han.joinRoom('conference@conference.rebels', 'Han');
            },

            function (cb) {
                chewie.once('muc:join', function (data) {
                    users.chewie.log('muc:join');
                    console.log(data);
                    cb();
                });
                chewie.joinRoom('conference@conference.rebels', 'Chewie');
            },

            function (cb) {
                r2d2.once('muc:join', function (data) {
                    users.r2d2.log('muc:join');

                    console.log(data);
                    cb();
                });
                r2d2.joinRoom('conference@conference.rebels', 'R2');
            },

            function (cb) {
                async.parallel([
                    function(callback){
                        han.once('message', function (msg) {
                            users.han.log('message', msg);
                            callback();
                        });
                    },
                    function(callback){
                        chewie.once('message', function (msg) {
                            users.chewie.log('message', msg);
                            callback();
                        });
                    },
                    function(callback){
                        r2d2.once('message', function (msg) {
                            users.r2d2.log('message', msg);
                            callback();
                        });
                    }
                ],
                
                function(err, results){
                    if (err) {
                        console.log(err);
                    } else {
                        cb();
                    }
                });

                han.sendMessage({
                    to: 'conference@conference.rebels',
                    body: 'Anybody there?',
                    type: 'groupchat'
                });
            },

            function (cb) {
                han.once('muc:leave', function (data) {
                    users.han.log('muc:leave');
                    console.log(data);
                    cb();
                });
                han.leaveRoom('conference@conference.rebels', 'Han');
            },

            function (cb) {
                chewie.once('muc:leave', function (data) {
                    users.chewie.log('muc:leave');
                    console.log(data);
                    cb();
                });
                chewie.leaveRoom('conference@conference.rebels', 'Chewie');
            },

            function (cb) {
                r2d2.once('muc:leave', function (data) {
                    users.r2d2.log('muc:leave');
                    console.log(data);
                    cb();
                });
                r2d2.leaveRoom('conference@conference.rebels', 'R2');
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
    });
    
});