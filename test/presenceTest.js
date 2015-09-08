#!/usr/bin/env node
'use strict';

var XmppClient = require('../lib/XmppClient');
var should = require('should');
var async = require('async');
var parseString = require('xml2js').parseString;


describe('XmppClient', function () {
    it('should send presence available', function (done) {

        var client = new XmppClient({
            jid:      'user01@clc',
            password: 'pass01',
            host:     'localhost'
        });

        client.on('stanza', function(xml) {
            parseString(xml, function (err, stanza) {
                stanza.should.have.property('presence');
                stanza.presence.should.have.property('show');
                stanza.presence.show[0].should.be.eql('chat');

                stanza.presence.should.have.property('status');
                stanza.presence.status[0].should.be.eql('available');

                client.disconnect();
                done();
            });
        });

        async.series([
            function (cb) {
                client.on('online', function () {
                    cb();
                });
            },
            function (cb) {
                client.sendPresence('chat', 'available');
                cb();
            }
        ]);

    });
});