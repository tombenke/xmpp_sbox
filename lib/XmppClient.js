#!/usr/bin/env node
'use strict';

var xmpp = require('node-xmpp-client');
var ltx = require('ltx');
var EventEmitter = require("events").EventEmitter;
var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: "XmppClient",
    stream: process.stdout,
    level: 'info'
});


function XmppClient(config) {
    log.debug(config);
    this.config = config;
    this.xmpp = new xmpp(this.config);

    this.ee = new EventEmitter();

    var me = this;
    this.xmpp.on('online', function(data) {
        log.debug(data);
        me.ee.emit('online', data);
    });
    this.xmpp.on('error', function(data) {
        log.debug(data);
        me.ee.emit('error', data);
    });
    this.xmpp.on('stanza', function(data) {
        log.debug(data);
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
    log.debug(msg);
    this.xmpp.send(msg);
}

XmppClient.prototype.sendSubscriptionReq = function(to) {
    var msg = new ltx.Element('presence', {to: to, type: 'subscribe'});
    log.debug(msg);
    this.xmpp.send(msg);
}

XmppClient.prototype.sendSubscriptionAck = function(to) {
    var msg = new ltx.Element('presence', {to: to, type: 'subscribed'});
    log.debug(msg);
    this.xmpp.send(el);
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
    log.debug('disconnected');
    this.xmpp.end();
}

module.exports = XmppClient;