#!/usr/bin/env node
'use strict';

var xmpp = require('node-xmpp-client');
var ltx = require('ltx');
var parseString = require('xml2js').parseString;
var EventEmitter = require("events").EventEmitter;
var _ = require('lodash');

var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ colorize: true, level: 'debug' }),
    ]
});
var pretty = require('pretty-data2').pd;
var parseString = require('xml2js').parseString;


function XmppClient(config) {
    logger.debug('new client with config:', config);

    this.config = config;
    this.msg = [];
    this.msgid = 1;

    this.ee = new EventEmitter();
}

/*
 *    CONNECTION
 */

XmppClient.prototype.connect = function (cb) {
    this.xmpp = new xmpp(this.config);

    var me = this;
    this.xmpp.on('online', function(data) {
        logger.debug(me.config.jid + ' is online\n', data);
        cb(data);
    });

    this.xmpp.on('stanza', function (data) {
        logger.info(me.config.jid + ' received stanza\n', pretty.xml(data.toString()));
        parseString(data, function (err, stanza) {
            if (_.get(stanza, ['presence', '$', 'id'])) {
                me.ee.emit(stanza.presence.$.id + '', stanza);
            }
        });
    });

    this.xmpp.on('error', function (data) {
        logger.error(me.config.jid + ' error\n', data);
    });
}

XmppClient.prototype.disconnect = function () {
    logger.debug(this.config.jid + ' disconnected');
    this.xmpp.end();
}

/*
 *    PRESENCE
 */

XmppClient.prototype.presence = function(show, status, cb) {
    var id = this.getIdAndIncrement();
    var msg = new ltx.Element('presence', { id: id })
        .c('show').t(show).up()
        .c('status').t(status);
    logger.info(this.config.jid + ' sent presence stanza\n', pretty.xml(msg.root().toString()));
    this.xmpp.send(msg);

    this.ee.once(id, cb);
}

/*
 *    SUBSCRIPTION
 */

XmppClient.prototype.sendSubscriptionReq = function(to, id) {
    var msg = new ltx.Element('presence', {to: to, id: id, type: 'subscribe'});
    log.info(this.logid + ' sent subscription request\n', pretty.xml(msg.root().toString()));
    this.xmpp.send(msg);
}

XmppClient.prototype.sendSubscriptionApp = function(to, id) {
    var msg = new ltx.Element('presence', {to: to, id: id, type: 'subscribed'});
    log.info(this.logid + ' sent subscription approve\n', pretty.xml(msg.root().toString()));
    this.xmpp.send(msg);
}

XmppClient.prototype.sendUnsubscribe = function(to, id) {
    var msg = new ltx.Element('presence', {to: to, id: id, type: 'unsubscribe'});
    log.info(this.logid + ' sent unsubscribe\n', pretty.xml(msg.root().toString()));
    this.xmpp.send(msg);
}

/*
 *    ROSTER
 */

XmppClient.prototype.sendRosterGet = function(id) {
    var msg = new ltx
        .Element('iq', {from: this.config.jid.user + '@' + this.config.jid.domain, id: id, type: 'get'})
            .c('query', { xmlns: 'jabber:iq:roster' });
    log.info(this.logid + ' sent get roster\n', pretty.xml(msg.root().toString()));
    this.xmpp.send(msg);
}

XmppClient.prototype.sendRemove = function(jid, id) {
    var msg = new ltx
        .Element('iq', {id: id, type: 'set'})
            .c('query', { xmlns: 'jabber:iq:roster' })
                .c('item', { jid: jid, subscription: 'remove' });
    log.info(this.logid + ' sent remove query\n', pretty.xml(msg.root().toString()));
    this.xmpp.send(msg);
}

/*
 *    UTILS
 */

function getStanzaType(xml) {
    return xml.toString().split(' ')[0].substr(1);
}

XmppClient.prototype.getIdAndIncrement = function() {
    return this.msgid++ + '';
}

/*
 *    CONSTANTS
 */

XmppClient.constants = {

    presence: {
        AWAY: 'away',
        CHAT: 'chat',
        DND:  'dnd',
        XA:   'xa'
    }

}

module.exports = XmppClient;