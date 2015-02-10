ground-control
========

An event emitter that takes inspiration from the erlang process model. As opposed to many other event emitters, `dispatch` registers objects rather callbacks. Each subscriber is expected to implement a `__receive(message, payload)` method, which pattern matches on message and does whatever through that.


## Hub API
`subscribe( message [, subscriber ] )`

`unsubscribe( message, subscriber )`

`emit( message, payload )`