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

            function () {
                done();
            }

        ]);
    });

    after(function() {
        han.disconnect();
    });
});