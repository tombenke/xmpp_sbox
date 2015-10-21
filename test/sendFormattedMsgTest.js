#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var logger = require('../libs/log');
var rebels = require('./testParameters').rebels();

var debug = false;
  
describe('XMPP message sending scenario', function () {

    var han, chewie;

    it('clients should send and receive messages', function (done) {
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
                han.once('subscribe', function (data) {
                    rebels.han.log('subscribe', data);
                    cb();
                })
                chewie.subscribe(rebels.han.jid);
            },

            function (cb) {
                chewie.once('subscribe', function (data) {
                    rebels.chewie.log('subscribe', data);
                    cb();
                })
                han.subscribe(rebels.chewie.jid);
            },

            function (cb) {
                chewie.once('subscribed', function (data) {
                    rebels.chewie.log('subscribed', data);
                    cb();
                });
                han.acceptSubscription(rebels.chewie.jid);
            },

            function (cb) {
                han.once('subscribed', function (data) {
                    rebels.han.log('subscribed', data);
                    cb();
                });
                chewie.acceptSubscription(rebels.han.jid);
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        rebels.han.log('roster', resp);

                        resp.should.have.property('roster');
                        resp.roster.should.have.property('items')
                        resp.roster.items[0].jid.full.should.equal(rebels.chewie.jid);
                        resp.roster.items[0].subscription.should.be.equal('both');

                        cb();
                    }

                });
            },

            function (cb) {
                chewie.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        rebels.chewie.log('roster', resp);

                        resp.should.have.property('roster');
                        resp.roster.should.have.property('items')
                        resp.roster.items[0].jid.full.should.equal(rebels.han.jid);
                        resp.roster.items[0].subscription.should.be.equal('both');

                        cb();
                    }
                });
            },

            function (cb) {
                chewie.once('message', function (msg) {
                    rebels.chewie.log('message', msg);

                    msg.should.have.property('to');
                    msg.to.full.should.be.equal(rebels.chewie.jid);
                    msg.should.have.property('body', 'Chewie,<br /> are you there?');

                    cb();
                });
                han.sendMessage({
                    to: rebels.chewie.jid,
                    body: 'Chewie,<br /> are you there?'
                });
            },

            function (cb) {
                han.once('message', function (msg) {
                    rebels.han.log('message', msg);

                    msg.should.have.property('to');
                    msg.to.full.should.be.equal(rebels.han.jid);
                    msg.should.have.property('body', 'Rrrrrrr-ghghghghgh!');

                    cb();
                });
                chewie.sendMessage({
                    to: rebels.han.jid,
                    body: 'Rrrrrrr-ghghghghgh!'
                });
            },

            function (cb) {
                chewie.once('unsubscribe', function (data) {
                    rebels.chewie.log('unsubscribe', data);
                    cb();
                })
                han.unsubscribe(rebels.chewie.jid);
            },

            function (cb) {
                han.once('unsubscribe', function (data) {
                    rebels.han.log('unsubscribe', data);
                    cb();
                })
                chewie.unsubscribe(rebels.han.jid);
            },

            function (cb) {
                chewie.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        rebels.chewie.log('roster', resp);

                        resp.should.have.property('roster');
                        resp.roster.should.have.property('items');
                        resp.roster.items[0].jid.full.should.be.equal(rebels.han.jid);
                        resp.roster.items[0].subscription.should.be.equal('none');

                        cb();
                    }
                });
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        rebels.han.log('roster', resp);

                        resp.should.have.property('roster');
                        resp.roster.should.have.property('items');
                        resp.roster.items[0].jid.full.should.be.equal(rebels.chewie.jid);
                        resp.roster.items[0].subscription.should.be.equal('none');

                        cb();
                    }
                });
            },

            function (cb) {
                chewie.removeRosterItem(rebels.han.jid, function () {
                    cb();
                });
            },

            function (cb) {
                han.removeRosterItem(rebels.chewie.jid, function () {
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

