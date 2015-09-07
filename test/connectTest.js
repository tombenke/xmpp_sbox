#!/usr/bin/env node
'use strict';

var XmppClient = require('../lib/XmppClient');
var should = require('should');


describe('XmppClient', function () {
    it('should connect to server', function (done) {

        var client = new XmppClient({
            jid:      'user01@clc',
            password: 'pass01',
            host:     'localhost'
        });

        client.on('online', function (data) {
            data.jid.should.have.property('local', 'user01');
            data.jid.should.have.property('domain', 'clc');
            data.jid.should.have.property('resource');
            data.jid.should.have.property('user', 'user01');
            done();
        });

    });
});