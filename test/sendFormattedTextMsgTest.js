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

describe('stanza.io messaging workflow', function () {

    var han, chewie;

    it('Clients should connect and send formatted text messages to each other', function (done) {
        this.timeout(3000);

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
                chewie.once('message', function (msg) {
                    users.chewie.log('message', msg);

                    msg.should.have.property('to');
                    msg.to.full.should.be.equal(users.chewie.jid);
                    msg.should.have.property('body', '_test_ <message>');

                    cb();
                });
                han.sendMessage({
                    to: users.chewie.jid,
                    body: '_test_ <message>'
                });
            },

            function (cb) {
                han.once('message', function (msg) {
                    users.han.log('message', msg);

                    msg.should.have.property('to');
                    msg.to.full.should.be.equal(users.han.jid);
                    msg.should.have.property('body', '<stream:stream>');

                    cb();
                });
                chewie.sendMessage({
                    to: users.han.jid,
                    body: '<stream:stream>'
                });
            },

            function () {
                done();
            }
        ]);
    });

    after(function() {
        chewie.disconnect();
        han.disconnect();
    });
    
});