#!/usr/bin/env node
'use strict';

module.exports.users = function(argument) {
	return {
        'Han_Solo': {
            jid:      'han.solo@rebels',
            password: 'pass123',
            host:     'localhost'
        },
        'Chewie': {
            jid:      'chewbacca@rebels',
            password: 'pass123',
            host:     'localhost'
        }
    };
};