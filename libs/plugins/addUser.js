module.exports = function (client, stanzas) {

	client.registerUser = function (from, to, sessionId, fields) {

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

		var msg = new Message();

		jxt.extend(Message, Command);
		jxt.extend(Command, X);
		jxt.extend(X, FormType);

		msg.from = from;
		msg.to = to;
		msg.type = 'set';
		msg.command.node = 'http://jabber.org/protocol/admin#add-user';
		msg.command.sessionid = sessionId;
		msg.command.x.type = 'submit';
		msg.command.x.formType.var = 'FORM_TYPE';
		msg.command.x.formType.type = 'hidden';
		msg.command.x.formType.value = 'http://jabber.org/protocol/admin';

		for (var field in fields) {

			var keyName = field;
			var varName = fields[field].varName;
			var value = fields[field].value;

		    var Field = jxt.define({
			    name: varName,
			    element: 'field',
			    fields: {
			        'var': helpers.attribute('var'),
			        value: helpers.textSub('', 'value')
			    }
			});

			jxt.extend(X, Field);

			msg.command.x[varName].var = varName;
			msg.command.x[varName].value = value;
		}

		client.sendIq(msg);

    };

};