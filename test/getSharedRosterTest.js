#!/usr/bin/env node
'use strict';

/*	Important Note: Create a shared roster group in web admin (add members, etc.),
	and ADD the group name to the 'Displayed Group:' field of the group to
	make it visible to group members on their individual roster.	*/

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var empire = require('./testParameters').empire();


var debug = false;
  
// TODO - missing tests
describe('XMPP shared roster', function () {

    var vader, tarkin;

    it('clients should see shared roster', function (done) {
        this.timeout(3000);

        async.series([

            function (cb) {

                tarkin = XMPP.createClient({
                    jid:       empire.tarkin.jid,
                    password:  empire.tarkin.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                vader = XMPP.createClient({
                    jid:       empire.vader.jid,
                    password:  empire.vader.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });
              
                cb();
            },

            function (cb) {
                if (debug === true) {
                    tarkin.on('*', function (name, data) {
                        console.dir(name);
                        console.dir(data);
                    });
                    vader.on('*', function (name, data) {
                        console.dir(name);
                        console.dir(data);
                    });
                }
                cb();
            },

            function (cb) {
                tarkin.once('session:started', function (data) {
                    empire.tarkin.log('session:started', data);
                    cb();
                });

                tarkin.connect();
            },

            function (cb) {
                tarkin.once('presence', function (data) {
                    empire.tarkin.log('presence', data);
                    cb();
                });
                tarkin.sendPresence({});
            },

            function (cb) {
                tarkin.getRoster(function (err, resp) {
                    empire.tarkin.log('roster', resp);

                    cb();
                });
            },

            function (cb) {
                vader.once('session:started', function (data) {
                    empire.vader.log('session:started', data);
                    cb();
                });
                vader.connect();
            },

            function (cb) {
                vader.once('presence', function (data) {
                    empire.vader.log('presence', data);
                    cb();
                });
                vader.sendPresence({});
            },

            function (cb) {
                tarkin.getRoster(function (err, resp) {
                    empire.tarkin.log('roster', resp);

                    cb();
                });
            },

            function () {
                done();
            }
        ]);
    });

    after(function() {
        vader.disconnect();
        tarkin.disconnect();
    });
    
});