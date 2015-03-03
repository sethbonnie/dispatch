PubHub
======

A simple pubsub module meant to facilitate a true messaging style of Object-Oriented programming. Through this architecture, objects subscribe for messages that they are interested in rather than manipulating other objects directly. This encourages a shared-nothing style where each object keeps track only of its own state.


## Hub API
`sub( message [, subscriber ] )`

`unsub( message, subscriber )`

`dispatch( message, payload )`