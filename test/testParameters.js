#!/usr/bin/env node
'use strict';

var logger = require('../libs/log');

module.exports.rebels = function() {
	return {
        rebelsAdmin: {
            jid:        'rebels.admin@rebels',
            password:   'pass123',
            host:       'localhost',
            log:        logger.createLogger('admin', { keysColor: 'red'}),
        },
        han: {
            jid:        'han.solo@rebels',
            password:   'pass123',
            host:       'localhost',
            log:        logger.createLogger('han.solo', { keysColor: 'cyan' }),
        },
        chewie: {
            jid:        'chewbacca@rebels',
            password:   'pass123',
            host:       'localhost',
            log:         logger.createLogger('chewbacca', { keysColor: 'yellow' }),
        },
        r2d2: {
            jid:        'r2d2@rebels',
            password:   'pass123',
            host:       'localhost',
            log:        logger.createLogger('r2d2', { keysColor: 'green' })
        },
        leia: {
            jid:        'leia.organa@rebels',
            password:   'pass123',
            host:       'localhost',
            log:        logger.createLogger('leia', { keysColor: 'magenta' })
        }
    };
};

module.exports.empire = function() {
    return {
        empireAdmin: {
            jid:        'empire.admin@empire',
            password:   'pass123',
            host:       'localhost',
            log:        logger.createLogger('admin', { keysColor: 'red'}),
        },
        vader: {
            jid:        'darth.vader@empire',
            password:   'pass123',
            host:       'localhost',
            log:        logger.createLogger('darth.vader', { keysColor: 'cyan' }),
        },
        sidious: {
            jid:        'darth.sidious@empire',
            password:   'pass123',
            host:       'localhost',
            log:        logger.createLogger('sidious', { keysColor: 'yellow' }),
        },
        tarkin: {
            jid:        'wilhuf.tarkin@empire',
            password:   'pass123',
            host:       'localhost',
            log:        logger.createLogger('tarkin', { keysColor: 'green' })
        },
        thrawn: {
            jid:        'thrawn@empire',
            password:   'pass123',
            host:       'localhost',
            log:        logger.createLogger('thrawn', { keysColor: 'magenta' })
        }
    };
};