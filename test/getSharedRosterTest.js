#!/usr/bin/env node
'use strict';

/*	Important Note: Create a shared roster group in web admin (add members, etc.),
	and ADD the group name to the 'Displayed Group:' field of the group to
	make it visible to group members on their individual roster.	*/

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
        log:      logger.createLogger('chewbacca', { keysColor: 'yellow' }),
    }
};
  
describe('stanza.io messaging workflow', function () {

    var han, chewie;

    it('Clients should connect and send messages to each other', function (done) {
        this.timeout(10000);

        async.series([

            function (cb) {

                han = XMPP.createClient({
                    jid:        users.han.jid,
                    password:   users.han.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                chewie = XMPP.createClient({
                    jid:       users.chewie.jid,
                    password:  users.chewie.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });
              
                cb();
            },

            function (cb) {
                if (debug === true) {
                    han.on('*', function (name, data) {
                        console.dir(name);
                        console.dir(data);
                    });
                    chewie.on('*', function (name, data) {
                        console.dir(name);
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
                han.once('presence', function (data) {
                    users.han.log('presence', data);
                    cb();
                });
                han.sendPresence({});
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    users.han.log('roster', resp);

                    cb();
                });
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
                han.getRoster(function (err, resp) {
                    users.han.log('roster', resp);

                    cb();
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

