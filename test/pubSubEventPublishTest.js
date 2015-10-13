#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var logger = require('../libs/log');

var debug = false;

var users = {
    admin: {
        jid:      'rebels.admin@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('admin', { keysColor: 'red', style: 'bold' }),
    },
    han: {
        jid:      'han.solo@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('han.solo', { keysColor: 'cyan' }),
    },
    chewie: {
        jid:      'chewbacca@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('chewbacca', { keysColor: 'yellow' }),
    },
};

describe('stanza.io PubSub workflow', function () {

    var admin, han, chewie, hanFullJid, chewieFullJid;

    it('Admin should create a node, publish an item, and others should receive that', function (done) {
        this.timeout(10000);

        async.series([

            function (cb) {
                admin = XMPP.createClient({
                    jid:       users.admin.jid,
                    password:  users.admin.password,
                    wsURL:     'ws://localhost:5280/websocket',
                    transport: 'websocket'
                });

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
                    admin.on('*', function (name, data) {
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
                admin.once('session:started', function (data) {
                    users.admin.log('session:started', data);
                    cb();
                });
                admin.connect();
            },

            function (cb) {
                admin.once('presence', function (data) {
                    users.admin.log('presence', data);
                    cb();
                });
                admin.sendPresence({});
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
                admin.createNode('pubsub.rebels', 'missionbriefing', '', function (err, resp) {
                    users.admin.log('create:node', resp);

                    resp.pubsub.should.have.property('create', 'missionbriefing');
                    
                    cb();
                });
            },

            function (cb) {
                han.getDiscoItems('pubsub.rebels', '', function (err, items) {
                    users.han.log('disco', items);
                    cb();
                });
            },

            function (cb) {
                han.subscribeToNode('pubsub.rebels', 'missionbriefing', function (err, resp) {
                    users.han.log('subscribe', resp);

                    resp.pubsub.subscription.should.have.property('node', 'missionbriefing');
                    resp.pubsub.subscription.should.have.property('subid');

                    cb();
                });
            },

            function (cb) {
                han.getSubscriptions('pubsub.rebels', '', function (err, subscriptions) {
                    users.han.log('get:subscriptions', subscriptions);

                    subscriptions.pubsub.subscriptions.list[0].should.have.property('node', 'missionbriefing');

                    cb();
                });
            },

            function (cb) {
                chewie.getDiscoItems('pubsub.rebels', '', function (err, items) {
                    users.chewie.log('disco', items);
                    cb();
                });
            },

            function (cb) {
                chewie.subscribeToNode('pubsub.rebels', 'missionbriefing', function (err, resp) {
                    users.chewie.log('subscribe', resp);

                    resp.pubsub.subscription.should.have.property('node', 'missionbriefing');
                    resp.pubsub.subscription.should.have.property('subid');

                    cb();
                });
            },

            function (cb) {
                chewie.getSubscriptions('pubsub.rebels', '', function (err, subscriptions) {
                    users.chewie.log('get:subscriptions', subscriptions);

                    subscriptions.pubsub.subscriptions.list[0].should.have.property('node', 'missionbriefing');

                    cb();
                });
            },

            function (cb) {
                async.parallel([
                    function(callback) {
                        han.once('pubsub:event', function (msg) {
		                    users.han.log('pubsub:event', msg);

                            msg.event.updated.should.have.property('node', 'missionbriefing');
                            msg.event.updated.published[0].json.should.have.property('value', 'Mission info');
                            msg.event.updated.published[0].json.should.have.property('value2', 'Mission start');
                            msg.event.updated.published[0].json.should.have.property('value3', 'Mission crew');

		                    callback();
		                });
                    },
                    function(callback) {
                        chewie.once('pubsub:event', function (msg) {
		                    users.chewie.log('pubsub:event', msg);

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
            	admin.publish('pubsub.rebels', 'missionbriefing', item, function (err, resp) {
            		users.admin.log('publish', resp);

                    resp.pubsub.publish.should.have.property('node', 'missionbriefing');
                    resp.pubsub.publish.items[0].should.have.property('id');

            	});
            },

            function (cb) {
            	han.once('unsubscribed', function (msg) {
                    users.han.log('unsubscribe', msg);
                });
                han.unsubscribeFromNode('pubsub.rebels', {node: 'missionbriefing', jid: han.jid.full}, function (err, resp) {
            		users.han.log('unsubscribe', resp);

                    resp.should.have.property('from');
                    resp.from.should.have.property('full', 'pubsub.rebels');
                    resp.should.have.property('to');
                    resp.to.should.have.property('full', han.jid.full);

            		cb();
                });
            },

            function (cb) {
            	chewie.once('unsubscribed', function (msg) {
                    users.chewie.log('unsubscribe', msg);
                });
                chewie.unsubscribeFromNode('pubsub.rebels', {node: 'missionbriefing', jid: chewie.jid.full}, function (err, resp) {
                    users.chewie.log('unsubscribe', resp);

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
    	admin.deleteNode('pubsub.rebels', 'missionbriefing', function (err, resp) {});
        chewie.disconnect();
        han.disconnect();
        admin.disconnect();
    });
    
});