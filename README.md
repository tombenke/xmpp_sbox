XMPP SandBox
=============

## About
This is a sandbox project, for experimental and demonstrational purposes.

It contains JavaScript implementation of basic tools and scenarios to do instant messaging via the XMPP protocol.

In order to run the code, you need a working XMPP server, such as ejabberd.

## Test environment
Follow the steps in [INSTRUCTIONS.md](INSTRUCTIONS.md) file to set up testing environment including ejabberd server installation and configuration, creating hosts and populate them automatically with test users, etc.

## Features and scenarios to demonstrate

### Agents

- Addressing individual persons and applications.
- Add extra properties to persons like role, type, position.
- Filtering/grouping recipients by extra properties.
- Get recipient list by filter criteria.
- Creating user accounts:
    - Bulk creation/upload.
    - From DB or registry like LDAP, etc.


### Ad-Hoc Free-text Messaging

- Send formatted free-text (XHTML) messages to one or more recipients.
- Receive formatted free-text messages.

### Transfer application specific payload between agents

- Send and receive application specific messages between agents.
- Handover/takeover of the payload via callbacks. 
- Handshake management with additional message properties:
    - acknowledge
    - confirmation of message
    - status handling
- Attachment handling via delivering URIs to attachment repositories.
- Message priority handling.

Sample message payload structure:

- contentType:
- timeStamp:
- typeOfMessage:
- status:
- eventType:
- attachments: []
- comments:

### Push notification

- Emulated push notification.
- Native push notification.

### Message history management

- Query message status.
- Query message history.
- ACL to message history.
- Query in payload (delegated to external component).

### Web client

- Simple web client (like, Candy).
- Web client integrated into an ExtJS app.

## Open topics, and questions

- How to get stream <features>?
- How to detect and handle <stream:error>?
- Basic IM use-cases:
    - Manage items in one's contact list
    - Exchange messages with one's contacts
    - Exchange presence information with one's contacts
    - Manage presence subscriptions to and from one's contacts
- Handling threads in messages
- building up a chat session between two parties

## References

- [ejabberd website](http://www.process-one.net/en/ejabberd/)
- [Candy webchat client](https://github.com/candy-chat)

### stanza.io related resources

- https://github.com/otalk/stanza.io
