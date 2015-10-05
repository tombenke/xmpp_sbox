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
  
describe('stanza.io messaging workflow', function () {

    var han, chewie;

    it('Clients should connect and send messages to each other', function (done) {
        this.timeout(20000);

        async.series([

            function (cb) {
                chewie = XMPP.createClient({
                    jid: users.Chewie.jid,
                    password: users.Chewie.password,
                    wsURL: 'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

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
                    chewie.on('*', function (name, data) {
                        log(users.Chewie.debugOptions, name, data);
                        //log(users.Chewie.debugOptions, data);
                    });
                    han.on('*', function (name, data) {
                        log(users.Han_Solo.debugOptions, name, data);
                        //log(users.Han_Solo.debugOptions, data);
                    });
                }
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
                    if (err) {
                        console.log(err);
                    } else {
                        should(resp).have.property('roster');
                        should(resp).have.property('from')
                        resp.from.full.should.equal(users.Chewie.jid);
                        log(users.Chewie.debugOptions, resp);
                    }
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
                chewie.subscribe(users.Han_Solo.jid);
                cb();
            },

            function (cb) {
                han.subscribe(users.Chewie.jid);
                cb();
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        should(resp).have.property('roster');
                        should(resp.roster).have.property('items')
                        resp.roster.items[0].jid.full.should.equal(users.Chewie.jid);
                        resp.roster.items[0].subscription.should.equal('none');
                        log(users.Han_Solo.debugOptions, resp);
                    }
                    cb();
                });
            },

            function (cb) {
                chewie.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        should(resp).have.property('roster');
                        should(resp.roster).have.property('items')
                        resp.roster.items[0].jid.full.should.equal(users.Han_Solo.jid);
                        resp.roster.items[0].subscription.should.equal('none');
                        log(users.Chewie.debugOptions, resp);
                    }
                    cb();
                });
            },

            function (cb) {
                chewie.acceptSubscription(users.Han_Solo.jid);
                cb();
            },

            function (cb) {
                han.acceptSubscription(users.Chewie.jid);
                cb();
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        should(resp).have.property('roster');
                        should(resp.roster).have.property('items')
                        resp.roster.items[0].jid.full.should.equal(users.Chewie.jid);
                        resp.roster.items[0].subscription.should.equal('both');
                        log(users.Han_Solo.debugOptions, resp);
                    }
                    cb();
                });
            },

            function (cb) {
                chewie.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        should(resp).have.property('roster');
                        should(resp.roster).have.property('items')
                        resp.roster.items[0].jid.full.should.equal(users.Han_Solo.jid);
                        resp.roster.items[0].subscription.should.equal('both');
                        log(users.Chewie.debugOptions, resp);
                    }
                    cb();
                });
            },

            function (cb) {
                chewie.on('message', function (msg) {
                    should(msg).have.property('to');
                    msg.to.full.should.equal(users.Chewie.jid);
                    should(msg).have.property('body', 'Chewie, are you there?');
                    log(users.Han_Solo.debugOptions, msg);
                    cb();
                });
                han.sendMessage({
                    to: users.Chewie.jid,
                    body: 'Chewie, are you there?'
                });
            },

            function (cb) {
                han.on('message', function (msg) {
                    should(msg).have.property('to');
                    msg.to.full.should.equal(users.Han_Solo.jid);
                    should(msg).have.property('body', 'Rrrrrrr-ghghghghgh!');
                    log(users.Chewie.debugOptions, msg);
                    cb();
                });
                chewie.sendMessage({
                    to: users.Han_Solo.jid,
                    body: 'Rrrrrrr-ghghghghgh!'
                });
            },

            function (cb) {
                han.unsubscribe(users.Chewie.jid);
                cb();
            },

            function (cb) {
                chewie.unsubscribe(users.Han_Solo.jid);
                cb();
            },

            function (cb) {
                chewie.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        log(users.Chewie.debugOptions, resp);
                    }
                    cb();
                });
            },

            function (cb) {
                han.getRoster(function (err, resp) {
                    if (err) {
                        console.log(err);
                    } else {
                        log(users.Han_Solo.debugOptions, resp);
                    }
                    cb();
                });
            },

            function () {
                done();
            }
        ]);
    });

    after(function() {
        chewie.removeRosterItem(users.Han_Solo.jid, function (err, resp) {
            if (err) {
                console.log(err);
            } else {
                log(users.Chewie.debugOptions, resp);
            }
        });
        han.removeRosterItem(users.Chewie.jid, function (err, resp) {
            if (err) {
                console.log(err);
            } else {
                log(users.Han_Solo.debugOptions, resp);
            }
        });
        chewie.disconnect();
        han.disconnect();
    });
    
});

