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
    }
};

describe('stanza.io offline message delivery test', function () {

    var han, chewie;

    it('A client should connect and send a message to an offline client', function (done) {
        this.timeout(10000);

        async.series([

            function (cb) {
                han = XMPP.createClient({
                    jid: users.han.jid,
                    password: users.han.password,
                    wsURL: 'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                cb();
            },

            function (cb) {
                if (debug === true) {
                    han.on('*', function (name, data) {
                        console.dir(data);
                    });
                }
                cb();
            },

            function (cb) {
                han.once('session:started', function (data) {
                    users.han.log('session:started', data);
                    cb();
                });

                han.connect();
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        resp.should.have.property('roster');
                        resp.should.have.property('from')
                        resp.from.full.should.equal(users.han.jid);
                        users.han.log('roster', resp);
                    }
                    cb();
                });
            },

            function (cb) {
                han.once('presence', function (data) {
                    users.han.log('presence', data);
                    cb();
                });
                han.sendPresence({});
            },

            function (cb) {
                han.sendMessage({
                    to: users.chewie.jid,
                    body: 'Chewie, are you there?'
                });
                cb();
            },

            function (cb) {
                han.on('disconnected', function () {
                    cb();
                })
                han.disconnect();  
            },

            function (cb) {
                chewie = XMPP.createClient({
                    jid: users.chewie.jid,
                    password: users.chewie.password,
                    wsURL: 'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                cb();
            },

            function (cb) {
                if (debug === true) {
                    chewie.on('*', function (name, data) {
                        console.dir(data);
                    });
                }
                cb();
            },

            function (cb) {
                chewie.once('message', function (msg) {
                    msg.should.have.property('to');
                    msg.to.full.should.equal(users.chewie.jid);
                    msg.should.have.property('body', 'Chewie, are you there?');
                    msg.should.have.property('delay');
                    users.chewie.log('message', msg);
                });
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
                chewie.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        resp.should.have.property('roster');
                        resp.should.have.property('from')
                        resp.from.full.should.equal(users.chewie.jid);
                        users.chewie.log('roster', resp);
                    }
                    cb();
                });
            },

            function (cb) {
                chewie.once('presence', function (data) {
                    users.chewie.log('presence', data);
                    cb();
                });
                chewie.sendPresence({});
            },

            function () {
                done();
            }

        ]);
    });

    after(function() {
        chewie.disconnect();
    });
});