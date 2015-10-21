#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var rebels = require('./testParameters').rebels();


var debug = false;

describe('XMPP offline message delivery', function () {

    var han, chewie;

    it('clients should send and receive offline messages', function (done) {
        this.timeout(3000);

        async.series([

            function (cb) {
                han = XMPP.createClient({
                    jid: rebels.han.jid,
                    password: rebels.han.password,
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
                    rebels.han.log('session:started', data);
                    cb();
                });

                han.connect();
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    resp.should.have.property('roster');
                    resp.should.have.property('from');
                    resp.from.full.should.equal(rebels.han.jid);
                    rebels.han.log('roster', resp);
                    cb();
                });
            },

            function (cb) {
                han.once('presence', function (data) {
                    rebels.han.log('presence', data);
                    cb();
                });
                han.sendPresence({});
            },

            function (cb) {
                han.sendMessage({
                    to: rebels.chewie.jid,
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
                    jid: rebels.chewie.jid,
                    password: rebels.chewie.password,
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
                    msg.to.full.should.equal(rebels.chewie.jid);
                    msg.should.have.property('body', 'Chewie, are you there?');
                    msg.should.have.property('delay');
                    rebels.chewie.log('message', msg);
                });
                cb();
            },

            function (cb) {
                chewie.once('session:started', function (data) {
                    rebels.chewie.log('session:started', data);
                    cb();
                });

                chewie.connect();
            },

            function (cb) {
                chewie.getRoster(function (err, resp) {
                    resp.should.have.property('roster');
                    resp.should.have.property('from');
                    resp.from.full.should.equal(rebels.chewie.jid);
                    rebels.chewie.log('roster', resp);
                    cb();
                });
            },

            function (cb) {
                chewie.once('presence', function (data) {
                    rebels.chewie.log('presence', data);
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