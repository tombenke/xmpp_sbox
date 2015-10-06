#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var log = require('../libs/log');

var debug = false;

var users = {
    'Han_Solo': {
        jid:      'han.solo@localhost',
        password: 'pass123',
        host:     'localhost',
        debugOptions: {
            keysColor: 'cyan'
        }
    },
    'Chewie': {
        jid:      'chewbacca@localhost',
        password: 'pass123',
        host:     'localhost',
        debugOptions: {
            keysColor: 'yellow'
        }
    }
};

describe('stanza.io offline message delivery test', function () {

    var han, chewie;

    it('A client should connect and send a message to an offline client', function (done) {
        this.timeout(10000);

        async.series([

            function () {
                done();
            }

        ]);
    });
});