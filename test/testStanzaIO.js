#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var log = require('../libs/log');

var debug = true;

var users = {
    'Han_Solo': {
        jid:      'han.solo@localhost',
        password: 'pass123',
        host:     'localhost',
        debugOptions: {
            keysColor: 'blue'
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
  
describe('stanza.io messaging workflow', function () {

    var han, chewie;

    it('Clients should connect and send messages to each other', function (done) {
        this.timeout(5000);

        async.series([

            function (cb) {
                chewie = XMPP.createClient({
                    jid: users.Chewie.jid,
                    password: users.Chewie.password,
                    wsURL: 'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

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
                    chewie.on('*', function (name, data) {
                        log(users.Chewie.debugOptions, name, data);
                        //log(users.Chewie.debugOptions, data);
                    });
                    han.on('*', function (name, data) {
                        log(users.Han_Solo.debugOptions, name, data);
                        //log(users.Han_Solo.debugOptions, data);
                    });
                }
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
                chewie.on('message', function (msg) {
                    log(users.Han_Solo.debugOptions, msg);
                    cb();
                });
                han.sendMessage({
                    to: users.Chewie.jid,
                    body: 'Chewie, are you there?'
                });
            },

            function (cb) {
                han.on('message', function (msg) {
                    log(users.Chewie.debugOptions, msg);
                    cb();
                });
                chewie.sendMessage({
                    to: users.Han_Solo.jid,
                    body: 'Rrrrrrr-ghghghghgh!'
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

