#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var rebels = require('./testParameters').rebels();


var debug = false;

describe('XMPP multi-user chat scenario', function () {

    var han, chewie, r2d2;

    it('clients should connect, join room and send multi-user chat messages', function (done) {
        this.timeout(3000);

        async.series([

            function (cb) {
                chewie = XMPP.createClient({
                    jid:       rebels.chewie.jid,
                    password:  rebels.chewie.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                han = XMPP.createClient({
                    jid:        rebels.han.jid,
                    password:   rebels.han.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                r2d2 = XMPP.createClient({
                    jid:        rebels.r2d2.jid,
                    password:   rebels.r2d2.password,
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
                    r2d2.on('*', function (name, data) {
                        console.dir(data);
                    });
                }
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
                chewie.once('presence', function (data) {
                    rebels.chewie.log('presence', data);
                    cb();
                });
                chewie.sendPresence({});
            },

            function (cb) {
                han.once('session:started', function (data) {
                    rebels.han.log('session:started', data);
                    cb();
                });
                han.connect();
            },

            function (cb) {
                han.once('presence', function (data) {
                    rebels.han.log('presence', data);
                    cb();
                });
                han.sendPresence({});
            },

            function (cb) {
                r2d2.once('session:started', function (data) {
                    rebels.r2d2.log('session:started', data);
                    cb();
                });
                r2d2.connect();
            },

            function (cb) {
                r2d2.once('presence', function (data) {
                    rebels.r2d2.log('presence', data);
                    cb();
                });
                r2d2.sendPresence({});
            },

            function (cb) {
                han.once('muc:join', function (data) {
                    rebels.han.log('muc:join', data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(rebels.han.jid);
                    data.should.have.property('from');
                    data.from.full.should.be.equal('conference@conference.rebels/Han');
                    data.should.have.property('type');
                    data.type.should.be.equal('available');

                    cb();
                });
                han.joinRoom('conference@conference.rebels', 'Han');
            },

            function (cb) {
                chewie.once('muc:join', function (data) {
                    rebels.chewie.log('muc:join', data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(rebels.chewie.jid);
                    data.should.have.property('from');
                    data.from.full.should.be.equal('conference@conference.rebels/Chewie');
                    data.should.have.property('type');
                    data.type.should.be.equal('available');

                    cb();
                });
                chewie.joinRoom('conference@conference.rebels', 'Chewie');
            },

            function (cb) {
                r2d2.once('muc:join', function (data) {
                    rebels.r2d2.log('muc:join', data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(rebels.r2d2.jid);
                    data.should.have.property('from');
                    data.from.full.should.be.equal('conference@conference.rebels/R2');
                    data.should.have.property('type');
                    data.type.should.be.equal('available');

                    cb();
                });
                r2d2.joinRoom('conference@conference.rebels', 'R2');
            },

            function (cb) {
                async.parallel([
                    function(callback){
                        han.once('message', function (msg) {
                            rebels.han.log('message', msg);

                            msg.should.have.property('to');
                            msg.to.bare.should.be.equal(rebels.han.jid);
                            msg.should.have.property('from');
                            msg.from.full.should.be.equal('conference@conference.rebels/Han');
                            msg.should.have.property('body', 'Anybody there?');

                            callback();
                        });
                    },
                    function(callback){
                        chewie.once('message', function (msg) {
                            rebels.chewie.log('message', msg);

                            msg.should.have.property('to');
                            msg.to.bare.should.be.equal(rebels.chewie.jid);
                            msg.should.have.property('from');
                            msg.from.full.should.be.equal('conference@conference.rebels/Han');
                            msg.should.have.property('body', 'Anybody there?');

                            callback();
                        });
                    },
                    function(callback){
                        r2d2.once('message', function (msg) {
                            rebels.r2d2.log('message', msg);
                            
                            msg.should.have.property('to');
                            msg.to.bare.should.be.equal(rebels.r2d2.jid);
                            msg.should.have.property('from');
                            msg.from.full.should.be.equal('conference@conference.rebels/Han');
                            msg.should.have.property('body', 'Anybody there?');

                            callback();
                        });
                    }
                ],
                
                function(err, results){
                    if (err) {
                        console.log(err);
                    } else {
                        cb();
                    }
                });

                han.sendMessage({
                    to: 'conference@conference.rebels',
                    body: 'Anybody there?',
                    type: 'groupchat'
                });
            },

            function (cb) {
                han.once('muc:leave', function (data) {
                    rebels.han.log('muc:leave', data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(rebels.han.jid);
                    data.should.have.property('from');
                    data.from.full.should.be.equal('conference@conference.rebels/Han');
                    data.should.have.property('type');
                    data.type.should.be.equal('unavailable');

                    cb();
                });
                han.leaveRoom('conference@conference.rebels', 'Han');
            },

            function (cb) {
                chewie.once('muc:leave', function (data) {
                    rebels.chewie.log('muc:leave', data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(rebels.chewie.jid);
                    data.should.have.property('from');
                    data.from.full.should.be.equal('conference@conference.rebels/Chewie');
                    data.should.have.property('type');
                    data.type.should.be.equal('unavailable');

                    cb();
                });
                chewie.leaveRoom('conference@conference.rebels', 'Chewie');
            },

            function (cb) {
                r2d2.once('muc:leave', function (data) {
                    rebels.r2d2.log('muc:leave', data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(rebels.r2d2.jid);
                    data.should.have.property('from');
                    data.from.full.should.be.equal('conference@conference.rebels/R2');
                    data.should.have.property('type');
                    data.type.should.be.equal('unavailable');

                    cb();
                });
                r2d2.leaveRoom('conference@conference.rebels', 'R2');
            },

            function () {
                done();
            }
        ]);
    });

    after(function() {
        chewie.disconnect();
        han.disconnect();
        r2d2.disconnect();
    });
    
});