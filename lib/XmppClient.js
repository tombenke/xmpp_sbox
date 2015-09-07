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
}

XmppClient.prototype.send = function() {
    console.log('msg')
    this.xmpp.send(new ltx.Element('presence', { })
      .c('show').t('chat').up()
      .c('status').t('Happily echoing your <message/> stanzas')
    )
}

module.exports = XmppClient;