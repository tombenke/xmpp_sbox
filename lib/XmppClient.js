#!/usr/bin/env node
'use strict';

var xmpp = require('node-xmpp-client');
var ltx = require('ltx');
var EventEmitter = require("events").EventEmitter;
var winston = require('winston');
var log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ colorize: true, level: 'info' }),
    ]
});
var pretty = require('pretty-data2').pd;


function XmppClient(config) {
    log.debug('new client with config:', config);
    this.config = config;
    this.xmpp = new xmpp(this.config);

    this.ee = new EventEmitter();
    this.logid = config.jid.user + '@' + config.jid.domain;

    var me = this;

    this.xmpp.on('online', function(data) {
        log.debug(me.logid + ' is online\n', data);
        me.ee.emit('online', data);
    });

    this.xmpp.on('error', function(data) {
        me.ee.emit('error', data);
    });

    this.xmpp.on('stanza', function(data) {
        log.info(me.logid + ' received stanza\n', pretty.xml(data.toString()));
        var type = getStanzaType(data);
        if (type === 'message')  me.ee.emit('message', data);
        if (type === 'presence') me.ee.emit('presence', data);
        if (type === 'iq')       me.ee.emit('iq', data);
    });
}

function getStanzaType(xml) {
    return xml.toString().split(' ')[0].substr(1);
}

XmppClient.prototype.on = function(event, cb) {
    this.ee.on(event, cb);
}

XmppClient.prototype.sendPresence = function(show, status) {
    var msg = new ltx.Element('presence', { }).c('show').t(show).up().c('status').t(status);
    log.info(this.logid + ' sent presence stanza\n', pretty.xml(msg.toString()));
    this.xmpp.send(msg);
}

XmppClient.prototype.sendSubscriptionReq = function(to) {
    var msg = new ltx.Element('presence', {to: to, type: 'subscribe'});
    log.info(this.logid + ' sent subscription request\n', pretty.xml(msg.toString()));
    this.xmpp.send(msg);
}

XmppClient.prototype.sendSubscriptionApp = function(to) {
    var msg = new ltx.Element('presence', {to: to, type: 'subscribed'});
    log.info(this.logid + ' sent subscription approve\n', pretty.xml(msg.toString()));
    this.xmpp.send(msg);
}

/*
XmppClient.prototype.send = function() {
    this.xmpp.send(new ltx.Element('presence', { })
      .c('show').t('chat').up()
      .c('status').t('Happily echoing your <message/> stanzas')
    );
}
*/

XmppClient.prototype.disconnect = function () {
    log.debug(this.logid + ' disconnected');
    this.xmpp.end();
}

module.exports = XmppClient;