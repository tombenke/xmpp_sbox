#!/usr/bin/env node
'use strict';

var XMPP = require('stanza.io');
var should = require('should');
var async = require('async');
var logger = require('../libs/log');

var debug = false;

var users = {
    han: {
        jid:      'han.solo@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('han.solo', { keysColor: 'cyan' })
    },
    chewie: {
        jid:      'chewbacca@rebels',
        password: 'pass123',
        host:     'localhost',
        log:      logger.createLogger('chewbacca', { keysColor: 'yellow' })
    }
};