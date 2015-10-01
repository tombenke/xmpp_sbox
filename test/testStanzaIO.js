#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var prettyjson = require('prettyjson');

// Options for prettyJSON
var options = {
  noColor: true
};

// Custom user data for testing
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
            
            // Create client object for Chewbacca
            function (cb) {
                chewie = XMPP.createClient({
                    jid: users.Chewie.jid,
                    password: users.Chewie.password,
                    wsURL: 'ws://localhost:5280/websocket',
                    transports: ['websocket']
                });

                cb();
            },

            // Create client object for Han Solo
            function (cb) {
                han = XMPP.createClient({
                    jid: users.Han_Solo.jid,
                    password: users.Han_Solo.password,
                    wsURL: 'ws://localhost:5280/websocket',
                    transports: ['websocket']
                });
              
                cb();
            },

            // Set session start listener for Chewbacca
            function (cb) {
                chewie.once('session:started', function () {
                    cb();
                });

                chewie.connect();
            },

            // Get roster for Chewbacca
            function (cb) {
                chewie.getRoster(function (err, resp) {
                    cb();
                });
            },

            // Chewbacca announces presence
            function (cb) {
                chewie.sendPresence({
                    
                });
                cb();
            },

            // Set session start listener for Han Solo
            function (cb) {
                han.once('session:started', function () {
                    cb();
                });

                han.connect();
            },

            // Get roster for Han Solo
            function (cb) {
                han.getRoster(function (err, resp) {
                    cb();
                });
            },

            // Han Solo announces presence
            function (cb) {
                han.sendPresence({
                    
                });
                cb();
            },

            // Set incoming message listener for Chewie to catch Han's message sent after
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

            // Set incoming message listener for Han to catch Chewie's response message sent after
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

            // Test end
            function (cb) {
                done();
            }
        ]);
    });

    //Call disconnect functions to make sure all test users disconnected, even if test fails
    after(function() {
        chewie.disconnect();
        han.disconnect();
    });
    
});

