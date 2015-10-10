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
    },
    r2d2: {
        jid:      'r2d2@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('r2d2', { keysColor: 'green' })
    }
};

describe('stanza.io messaging workflow', function () {

    var han, chewie, r2d2;

    it('Clients should connect, join room and send multi-user chat messages to each other', function (done) {
        this.timeout(10000);

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

                r2d2 = XMPP.createClient({
                    jid:        users.r2d2.jid,
                    password:   users.r2d2.password,
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
                r2d2.once('session:started', function (data) {
                    users.r2d2.log('session:started', data);
                    cb();
                });
                r2d2.connect();
            },

            function (cb) {
                r2d2.once('presence', function (data) {
                    users.r2d2.log('presence', data);
                    cb();
                });
                r2d2.sendPresence({});
            },

            function (cb) {
                han.once('muc:join', function (data) {
                    users.han.log('muc:join');
                    console.log(data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(users.han.jid);
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
                    users.chewie.log('muc:join');
                    console.log(data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(users.chewie.jid);
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
                    users.r2d2.log('muc:join');
                    console.log(data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(users.r2d2.jid);
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
                            users.han.log('message', msg);

                            msg.should.have.property('to');
                            msg.to.bare.should.be.equal(users.han.jid);
                            msg.should.have.property('from');
                            msg.from.full.should.be.equal('conference@conference.rebels/Han');
                            msg.should.have.property('body', 'Anybody there?');

                            callback();
                        });
                    },
                    function(callback){
                        chewie.once('message', function (msg) {
                            users.chewie.log('message', msg);

                            msg.should.have.property('to');
                            msg.to.bare.should.be.equal(users.chewie.jid);
                            msg.should.have.property('from');
                            msg.from.full.should.be.equal('conference@conference.rebels/Han');
                            msg.should.have.property('body', 'Anybody there?');

                            callback();
                        });
                    },
                    function(callback){
                        r2d2.once('message', function (msg) {
                            users.r2d2.log('message', msg);
                            
                            msg.should.have.property('to');
                            msg.to.bare.should.be.equal(users.r2d2.jid);
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
                    users.han.log('muc:leave');
                    console.log(data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(users.han.jid);
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
                    users.chewie.log('muc:leave');
                    console.log(data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(users.chewie.jid);
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
                    users.r2d2.log('muc:leave');
                    console.log(data);

                    data.should.have.property('muc');
                    data.should.have.property('to');
                    data.to.bare.should.be.equal(users.r2d2.jid);
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