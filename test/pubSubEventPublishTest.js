#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var logger = require('../libs/log');
var rebels = require('./testParameters').rebels;

var debug = false;

describe('stanza.io PubSub workflow', function () {

    var rebelsAdmin, han, chewie;

    it('Admin should create a node, publish an item, and others should receive that', function (done) {
        this.timeout(10000);

        async.series([

            function (cb) {
                rebelsAdmin = XMPP.createClient({
                    jid:       rebels().rebelsAdmin.jid,
                    password:  rebels().rebelsAdmin.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                chewie = XMPP.createClient({
                    jid:       rebels().chewie.jid,
                    password:  rebels().chewie.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                han = XMPP.createClient({
                    jid:        rebels().han.jid,
                    password:   rebels().han.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

                cb();
            },

            function (cb) {
                if (debug === true) {
                    rebelsAdmin.on('*', function (name, data) {
                        console.dir(name);
                        console.dir(data);
                    });
                    chewie.on('*', function (name, data) {
                        console.dir(name);
                        console.dir(data);
                    });
                    han.on('*', function (name, data) {
                        console.dir(name);
                        console.dir(data);
                    });
                }
                cb();
            },
            function (cb) {
                rebelsAdmin.once('session:started', function (data) {
                    rebels().rebelsAdmin.log('session:started', data);
                    cb();
                });
                rebelsAdmin.connect();
            },

            function (cb) {
                rebelsAdmin.once('presence', function (data) {
                    rebels().rebelsAdmin.log('presence', data);
                    cb();
                });
                rebelsAdmin.sendPresence({});
            },

            function (cb) {
                chewie.once('session:started', function (data) {
                    rebels().chewie.log('session:started', data);
                    cb();
                });
                chewie.connect();
            },

            function (cb) {
                chewie.once('presence', function (data) {
                    rebels().chewie.log('presence', data);
                    cb();
                });
                chewie.sendPresence({});
            },

            function (cb) {
                han.once('session:started', function (data) {
                    rebels().han.log('session:started', data);
                    cb();
                });
                han.connect();
            },

            function (cb) {
                han.once('presence', function (data) {
                    rebels().han.log('presence', data);
                    cb();
                });
                han.sendPresence({});
            },

            function (cb) {
                rebelsAdmin.createNode('pubsub.rebels', 'missionbriefing', '', function (err, resp) {
                    rebels().rebelsAdmin.log('create:node', resp);

                    resp.pubsub.should.have.property('create', 'missionbriefing');
                    
                    cb();
                });
            },

            function (cb) {
                han.getDiscoItems('pubsub.rebels', '', function (err, items) {
                    rebels().han.log('disco', items);
                    cb();
                });
            },

            function (cb) {
                han.subscribeToNode('pubsub.rebels', 'missionbriefing', function (err, resp) {
                    rebels().han.log('subscribe', resp);

                    resp.pubsub.subscription.should.have.property('node', 'missionbriefing');
                    resp.pubsub.subscription.should.have.property('subid');

                    cb();
                });
            },

            function (cb) {
                han.getSubscriptions('pubsub.rebels', '', function (err, subscriptions) {
                    rebels().han.log('get:subscriptions', subscriptions);

                    subscriptions.pubsub.subscriptions.list[0].should.have.property('node', 'missionbriefing');

                    cb();
                });
            },

            function (cb) {
                chewie.getDiscoItems('pubsub.rebels', '', function (err, items) {
                    rebels().chewie.log('disco', items);
                    cb();
                });
            },

            function (cb) {
                chewie.subscribeToNode('pubsub.rebels', 'missionbriefing', function (err, resp) {
                    rebels().chewie.log('subscribe', resp);

                    resp.pubsub.subscription.should.have.property('node', 'missionbriefing');
                    resp.pubsub.subscription.should.have.property('subid');

                    cb();
                });
            },

            function (cb) {
                chewie.getSubscriptions('pubsub.rebels', '', function (err, subscriptions) {
                    rebels().chewie.log('get:subscriptions', subscriptions);

                    subscriptions.pubsub.subscriptions.list[0].should.have.property('node', 'missionbriefing');

                    cb();
                });
            },

            function (cb) {
                async.parallel([
                    function(callback) {
                        han.once('pubsub:event', function (msg) {
                            rebels().han.log('pubsub:event', msg);

                            msg.event.updated.should.have.property('node', 'missionbriefing');
                            msg.event.updated.published[0].json.should.have.property('value', 'Mission info');
                            msg.event.updated.published[0].json.should.have.property('value2', 'Mission start');
                            msg.event.updated.published[0].json.should.have.property('value3', 'Mission crew');

                            callback();
                        });
                    },
                    function(callback) {
                        chewie.once('pubsub:event', function (msg) {
                            rebels().chewie.log('pubsub:event', msg);

                            msg.event.updated.should.have.property('node', 'missionbriefing');
                            msg.event.updated.published[0].json.should.have.property('value', 'Mission info');
                            msg.event.updated.published[0].json.should.have.property('value2', 'Mission start');
                            msg.event.updated.published[0].json.should.have.property('value3', 'Mission crew');

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

                var item = {
                    json: {
                        value: 'Mission info',
                        value2: 'Mission start',
                        value3: 'Mission crew'
                    }
                };
                rebelsAdmin.publish('pubsub.rebels', 'missionbriefing', item, function (err, resp) {
                    rebels().rebelsAdmin.log('publish', resp);

                    resp.pubsub.publish.should.have.property('node', 'missionbriefing');
                    resp.pubsub.publish.items[0].should.have.property('id');

                });
            },

            function (cb) {
                han.once('unsubscribed', function (msg) {
                    rebels().han.log('unsubscribe', msg);
                });
                han.unsubscribeFromNode('pubsub.rebels', {node: 'missionbriefing', jid: han.jid.full}, function (err, resp) {
                    rebels().han.log('unsubscribe', resp);

                    resp.should.have.property('from');
                    resp.from.should.have.property('full', 'pubsub.rebels');
                    resp.should.have.property('to');
                    resp.to.should.have.property('full', han.jid.full);

                    cb();
                });
            },

            function (cb) {
                chewie.once('unsubscribed', function (msg) {
                    rebels().chewie.log('unsubscribe', msg);
                });
                chewie.unsubscribeFromNode('pubsub.rebels', {node: 'missionbriefing', jid: chewie.jid.full}, function (err, resp) {
                    rebels().chewie.log('unsubscribe', resp);

                    resp.should.have.property('from');
                    resp.from.should.have.property('full', 'pubsub.rebels');
                    resp.should.have.property('to');
                    resp.to.should.have.property('full', chewie.jid.full);

                    cb();
                });
            },

            function () {
                done();
            }
        ]);
    });

    after(function() {
        rebelsAdmin.deleteNode('pubsub.rebels', 'missionbriefing', function (err, resp) {});
        chewie.disconnect();
        han.disconnect();
        rebelsAdmin.disconnect();
    });
    
});