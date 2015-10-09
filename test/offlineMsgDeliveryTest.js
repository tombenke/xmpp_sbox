#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var log = require('../libs/log');

var debug = false;

var users = {
    'Han_Solo': {
        jid:      'han.solo@localhost',
        password: 'pass123',
        host:     'localhost',
        debugOptions: {
            keysColor: 'cyan'
        }
    },
    'Chewie': {
        jid:      'chewbacca@localhost',
        password: 'pass123',
        host:     'localhost',
        debugOptions: {
            keysColor: 'yellow'
        }
    }
};

describe('stanza.io offline message delivery test', function () {

    var han, chewie;

    it('A client should connect and send a message to an offline client', function (done) {
        this.timeout(10000);

        async.series([

            function (cb) {
                han = XMPP.createClient({
                    jid: users.Han_Solo.jid,
                    password: users.Han_Solo.password,
                    wsURL: 'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                cb();
            },

            function (cb) {
                if (debug === true) {
                    han.on('*', function (name, data) {
                        log(users.Han_Solo.debugOptions, name, data);
                    });

                    }
                cb();
            },

            function (cb) {
                han.once('session:started', function () {
                    cb();
                });

                han.connect();
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        should(resp).have.property('roster');
                        should(resp).have.property('from')
                        resp.from.full.should.equal(users.Han_Solo.jid);
                        log(users.Han_Solo.debugOptions, resp);
                    }
                    cb();
                });
            },

            function (cb) {
                han.sendPresence({
                    
                });
                cb();
            },

            function (cb) {
                han.sendMessage({
                    to: users.Chewie.jid,
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
                    jid: users.Chewie.jid,
                    password: users.Chewie.password,
                    wsURL: 'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                cb();
            },

            function (cb) {
                if (debug === true) {
                    chewie.on('*', function (name, data) {
                        log(users.Chewie.debugOptions, name, data);
                    });
                }
                cb();
            },

            function (cb) {
                chewie.on('message', function (msg) {
                    should(msg).have.property('to');
                    msg.to.full.should.equal(users.Chewie.jid);
                    should(msg).have.property('body', 'Chewie, are you there?');
                    should(msg).have.property('delay');
                    log(users.Han_Solo.debugOptions, msg);
                });
                cb();
            },

            function (cb) {
                chewie.once('session:started', function () {
                    cb();
                });

                chewie.connect();
            },

            function (cb) {
                chewie.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        should(resp).have.property('roster');
                        should(resp).have.property('from')
                        resp.from.full.should.equal(users.Chewie.jid);
                        log(users.Chewie.debugOptions, resp);
                    }
                    cb();
                });
            },

            function (cb) {
                chewie.sendPresence({
                    
                });
                cb();
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