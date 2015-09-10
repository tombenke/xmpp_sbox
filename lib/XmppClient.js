#!/usr/bin/env node
'use strict';

var xmpp = require('node-xmpp-client');
var ltx = require('ltx');
var parseString = require('xml2js').parseString;
var EventEmitter = require("events").EventEmitter;
var _ = require('lodash');
var utils = require('./Utils');

var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ colorize: true, level: 'info' }),
    ]
});
var pretty = require('pretty-data2').pd;
var parseString = require('xml2js').parseString;


function XmppClient(config, idstart) {
    logger.debug('new client with config:', config);

    this.config = config;
    this.msg = [];
    this.msgid = idstart || 1;

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
        logger.debug(me.config.jid + ' received stanza\n', pretty.xml(data.toString()));
        var data = data.toString();
        parseString(data, function (err, stanza) {
            //console.dir(stanza)

            if (_.get(stanza, ['presence', '$', 'id'])) {
                me.ee.emit(stanza.presence.$.id + '', data);
            }

            if (_.get(stanza, ['iq', '$', 'id'])) {
                me.ee.emit('iq', data, stanza);
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
    var me = this;
    this.ee.once(id, function(xml) {
        logger.info(me.config.jid + ' received presence stanza\n', pretty.xml(xml.toString()));
        cb();
    });
}

/*
 *    SUBSCRIPTION
 */

XmppClient.prototype.subscription = function(type, to, cb) {
    var msg = new ltx.Element('presence', {to: to, type: type});
    logger.info(this.config.jid + ' sent subscription stanza\n', pretty.xml(msg.root().toString()));
    this.xmpp.send(msg);

    var me = this;
    this.ee.on('iq', function(xml, json) {
        var contacts = utils.getContactsFromRoster(json);
        if (_.includes(contacts, to)) {
            logger.info(me.config.jid + ' received iq stanza\n', pretty.xml(xml.toString()));
            cb();
        }
    });
}

/*
 *    ROSTER
 */

XmppClient.prototype.getRoster = function(cb) {
    var id = this.getIdAndIncrement();
    var msg = new ltx
        .Element('iq', {id: this.config.jid, type: 'get'})
            .c('query', { xmlns: 'jabber:iq:roster' });

    log.info(this.logid + ' sent get roster\n', pretty.xml(msg.root().toString()));
    this.xmpp.send(msg);
    var me = this;
    this.ee.once(id, function(data) {
        logger.info(me.config.jid + ' received roster\n', pretty.xml(data.toString()));
        cb();
    });
}

XmppClient.prototype.remove = function(jid, id) {
    var msg = new ltx
        .Element('iq', {id: id, type: 'set'})
            .c('query', { xmlns: 'jabber:iq:roster' })
                .c('item', { jid: jid, subscription: 'remove' });
    logger.info(this.logid + ' sent remove query\n', pretty.xml(msg.root().toString()));
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
    },

    subscription: {
        REQUEST: 'subscribe',
        APPROVE: 'subscribed',
        DENY:    'unsubscribe'
    }

}

module.exports = XmppClient;