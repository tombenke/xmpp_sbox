module.exports = function (client, stanzas) {

	client.unregisterUser = function (from, to, sessionId, userJid) {

		var jxt = require('../../node_modules/stanza.io/node_modules/jxt').createRegistry();
		var helpers = jxt.utils;

		var Message = jxt.define({
		    name: 'iq',
		    element: 'iq',
		    fields: {
		        to: helpers.attribute('to'),
		        from: helpers.attribute('from'),
		        type: helpers.attribute('type'),
		    }
		});

		var Command = jxt.define({
		    name: 'command',
		    namespace: 'http://jabber.org/protocol/commands',
		    element: 'command',
		    fields: {
		        text: helpers.text(),
		        node: helpers.attribute('node'),
		        sessionid: helpers.attribute('sessionid')
		    }
		});

		var X = jxt.define({
		    name: 'x',
		    namespace: 'jabber:x:data',
		    element: 'x',
		    fields: {
		        text: helpers.text(),
		        type: helpers.attribute('type')
		    }
		});

		var FormType = jxt.define({
		    name: 'formType',
		    element: 'field',
		    fields: {
		    	type: helpers.attribute('type'),
		        'var': helpers.attribute('var'),
		        value: helpers.textSub('', 'value')
		    }
		});

		var AccountJID = jxt.define({
		    name: 'accountjid',
		    element: 'field',
		    fields: {
		    	'var': helpers.attribute('var'),
		    	value: helpers.textSub('', 'value')
		    }
		});

		jxt.extend(Message, Command);
		jxt.extend(Command, X);
		jxt.extend(X, FormType);
		jxt.extend(X, AccountJID);

		var msg = new Message();

		msg.from = from;
		msg.to = to;
		msg.type = 'set';
		msg.command.node = 'http://jabber.org/protocol/admin#delete-user';
		msg.command.sessionid = sessionId;
		msg.command.x.type = 'submit';
		msg.command.x.formType.var = 'FORM_TYPE';
		msg.command.x.formType.type = 'hidden';
		msg.command.x.formType.value = 'http://jabber.org/protocol/admin';
		msg.command.x.accountjid.var = 'accountjids';
		msg.command.x.accountjid.value = userJid;

        client.sendIq(msg);

    };

};
