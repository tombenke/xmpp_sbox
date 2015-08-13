#!/usr/bin/env node
'use strict';

var xmpp = require('node-xmpp-client');
var ltx = require('ltx');

var client = new xmpp({ jid: 'tombenke@u204400m1', password: 'tombenke' });

client.on('online', function() {
    console.log('[online]');
    client.send(new ltx.Element('presence', { })
      .c('show').t('chat').up()
      .c('status').t('Happily echoing your <message/> stanzas')
    );
});

client.on('stanza', function(stanza) {
    console.log('[stanza]: ', stanza.toString());
});

client.on('error', function(e) {
    console.error(e);
});

client.end();