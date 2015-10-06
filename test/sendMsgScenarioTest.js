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
    }
};
  
describe('stanza.io messaging workflow', function () {

    var han, chewie;

    it('Clients should connect and send messages to each other', function (done) {
        this.timeout(3000);

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
                han.once('subscribe', function (data) {
                    users.han.log('subscribe', data);
                    cb();
                })
                chewie.subscribe(users.han.jid);
            },

            function (cb) {
                chewie.once('subscribe', function (data) {
                    users.chewie.log('subscribe', data);
                    cb();
                })
                han.subscribe(users.chewie.jid);
            },

            function (cb) {
                chewie.once('subscribed', function (data) {
                    users.chewie.log('subscribed', data);
                    cb();
                });
                han.acceptSubscription(users.chewie.jid);
            },

            function (cb) {
                han.once('subscribed', function (data) {
                    users.han.log('subscribed', data);
                    cb();
                });
                chewie.acceptSubscription(users.han.jid);
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        users.han.log('roster', resp);

                        resp.should.have.property('roster');
                        resp.roster.should.have.property('items')
                        resp.roster.items[0].jid.full.should.equal(users.chewie.jid);
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
                        users.chewie.log('roster', resp);

                        resp.should.have.property('roster');
                        resp.roster.should.have.property('items')
                        resp.roster.items[0].jid.full.should.equal(users.han.jid);
                        resp.roster.items[0].subscription.should.be.equal('both');

                        cb();
                    }
                });
            },

            function (cb) {
                chewie.once('message', function (msg) {
                    users.chewie.log('message', msg);

                    msg.should.have.property('to');
                    msg.to.full.should.be.equal(users.chewie.jid);
                    msg.should.have.property('body', 'Chewie, are you there?');

                    cb();
                });
                han.sendMessage({
                    to: users.chewie.jid,
                    body: 'Chewie, are you there?'
                });
            },

            function (cb) {
                han.once('message', function (msg) {
                    users.han.log('message', msg);

                    msg.should.have.property('to');
                    msg.to.full.should.be.equal(users.han.jid);
                    msg.should.have.property('body', 'Rrrrrrr-ghghghghgh!');

                    cb();
                });
                chewie.sendMessage({
                    to: users.han.jid,
                    body: 'Rrrrrrr-ghghghghgh!'
                });
            },

            function (cb) {
                chewie.once('unsubscribe', function (data) {
                    users.chewie.log('unsubscribe', data);
                    cb();
                })
                han.unsubscribe(users.chewie.jid);
            },

            function (cb) {
                han.once('unsubscribe', function (data) {
                    users.han.log('unsubscribe', data);
                    cb();
                })
                chewie.unsubscribe(users.han.jid);
            },

            function (cb) {
                chewie.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        users.chewie.log('roster', resp);

                        resp.should.have.property('roster');
                        resp.roster.should.have.property('items');
                        resp.roster.items[0].jid.full.should.be.equal(users.han.jid);
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
                        users.han.log('roster', resp);

                        resp.should.have.property('roster');
                        resp.roster.should.have.property('items');
                        resp.roster.items[0].jid.full.should.be.equal(users.chewie.jid);
                        resp.roster.items[0].subscription.should.be.equal('none');

                        cb();
                    }
                });
            },

            function () {
                done();
            }
        ]);
    });

    after(function() {
        chewie.removeRosterItem(users.han.jid, function () {
        });
        han.removeRosterItem(users.chewie.jid, function () {
        });
        chewie.disconnect();
        han.disconnect();
    });
    
});

