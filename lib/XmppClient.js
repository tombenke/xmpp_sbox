#!/usr/bin/env node
'use strict';

var xmpp = require('node-xmpp-client');
var ltx = require('ltx');

function XmppClient(config) {
    this.config = config;
    this.xmpp = new xmpp(this.config);
}

XmppClient.prototype.on = function(event, cb) {
    if (event === 'online') this.xmpp.on('online', cb);
    if (event === 'stanza') this.xmpp.on('stanza', function (event) {
    
    });
}

XmppClient.prototype.sendPresence = function(show, status) {
    var msg = new ltx.Element('presence', { }).c('show').t(show).up().c('status').t(status);
    this.xmpp.send(msg);
}

XmppClient.prototype.sendSubscriptionReq = function(to) {
    var el = new ltx.Element('presence', {to: to, type: 'subscribe'});
    console.log(el.root().toString());
    this.xmpp.send(el);
}

XmppClient.prototype.sendSubscriptionAck = function(to) {
    var el = new ltx.Element('presence', {to: to, type: 'subscribed'});
    console.log(el.root().toString());
    this.xmpp.send(el);
}

XmppClient.prototype.send = function() {
    this.xmpp.send(new ltx.Element('presence', { })
      .c('show').t('chat').up()
      .c('status').t('Happily echoing your <message/> stanzas')
    );
}

XmppClient.prototype.disconnect = function () {
    this.xmpp.end();
}

module.exports = XmppClient;