#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var prettyjson = require('prettyjson');

var options = {
  noColor: true
};

var users = {
    'Han_Solo': {
        jid:      'han.solo@localhost',
        password: 'pass123',
        host:     'localhost'
    },
    'Chewie': {
        jid:      'chewbacca@localhost',
        password: 'pass123',
        host:     'localhost'
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
                    transports: ['websocket']
                });

                han = XMPP.createClient({
                    jid: users.Han_Solo.jid,
                    password: users.Han_Solo.password,
                    wsURL: 'ws://localhost:5280/websocket',
                    transports: ['websocket']
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
                    console.log('Han\'s message to Chewie:\n' + prettyjson.render(msg, options) + '\n');
                    cb();
                });
                han.sendMessage({
                    to: users.Chewie.jid,
                    body: 'Chewie, are you there?'
                });
            },

            function (cb) {
                han.on('message', function (msg) {
                    console.log('Chewie\'s message to Han:\n' + prettyjson.render(msg, options) + '\n');
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

