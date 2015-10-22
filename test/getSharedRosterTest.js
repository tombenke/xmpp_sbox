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

describe('XMPP shared roster', function () {

    var vader, sidious;

    it('clients should see shared roster', function (done) {
        this.timeout(3000);

        async.series([

            function (cb) {

                sidious = XMPP.createClient({
                    jid:       empire.sidious.jid,
                    password:  empire.sidious.password,
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
                    sidious.on('*', function (name, data) {
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
                sidious.once('session:started', function (data) {
                    empire.sidious.log('session:started', data);
                    cb();
                });

                sidious.connect();
            },

            function (cb) {
                sidious.once('presence', function (data) {
                    empire.sidious.log('presence', data);
                    cb();
                });
                sidious.sendPresence({});
            },

            function (cb) {
                sidious.getRoster(function (err, resp) {
                    empire.sidious.log('roster', resp);

                    resp.roster.should.have.property('items');
                    resp.roster.items[0].should.have.property('groups');
                    resp.roster.items[0].groups[0].should.be.exactly('Sith Lords');

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
                sidious.getRoster(function (err, resp) {
                    empire.sidious.log('roster', resp);

                    resp.roster.should.have.property('items');
                    resp.roster.items[0].should.have.property('groups');
                    resp.roster.items[0].groups[0].should.be.exactly('Sith Lords');

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
        sidious.disconnect();
    });
    
});