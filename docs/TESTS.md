- ['About tests'](About tests)
    - ['Create a client object'](Create a client object)

#### About tests

In the 'test' directory of xmpp_sbox project, a ‘testParameters.js’ file can be found. It is a simple module file that returns objects containing the default test users' credentials and some other properties for test purposes like logging function, etc.

### General test functions

Every tests utilize these steps.

#### Require Stanza.io library

Require Stanza.io library

```javascript
var XMPP = require('stanza.io');
```

#### Initialize new client

Create a new 'client' object, with parameter 'options' which is an object described below

Note: using websocket type transport

options:
- 'jid': registered jabber id of the user (example: 'han.solo@rebels')
- 'password': password of the user (in tests all users default password 'pass123')
- 'wsURL': websocket URL with port and resource (example: 'ws://localhost:5280/websocket')
- 'transport': type of transport ('websocket')

```javascript
var client;

client = XMPP.createClient(options);
```

#### Connect to ejabberd server

```javascript
client.connect();
```

Wait for server response 'session:started' before callback to assure the connection established according to xmpp protocol and log response data on the console.

```javascript
client.once('session:started', function (data) {
    testClient.log('session:started', data);
    cb();
});
```

#### Send presence status

Send presence status, to set client presence state 'online'. The parameter object (thus presence stanza) is empty according to xmpp protocol.

```javascript
client.sendPresence({});
```

Wait for server response 'presence' before callback to assure the presence is acknowledged according to xmpp protocol and log out response data.

```javascript
client.once('presence', function (data) {
    testClient.log('presence', data);
    cb();
});
```

### Use case specific test functions

#### Send simple message

The sendMessage() function expects an object with the following  parameters:

- 'to': the jabber id of the recepient
- 'body': message body

Example:
```javascript
client.sendMessage({to: 'username@host', body: 'This is a test message.'});
```

#### Roster functions

##### Get roster

The getRoster() function expects a callback function to handle the response

```javascript
client.getRoster(function (err, resp) {
	//custom code
});
```

If there is no error, the response will contain the roster of the requesting user.

##### Subscribe to user

The subscribe() function expects a string type parameter, the jabber id of the user that subscription request sent to.

```javascript
client.subscribe('user@example.com');
```

##### Accept subscription request

The user who received a subscription request has to accept the subscription.

The acceptSubscription() function expects a string type parameter, the jabber id of the user that subscription request received from.

```javascript
client.acceptSubscription('user@example.com');
```