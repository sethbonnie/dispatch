dispatch
========

An event dispatcher.


As opposed to many other event emitters, `dispatch` registers objects rather callbacks. This is more to emulate an FSM where each module decides what to do based on its input. A callback is more flexible, but in my experience the FSM model puts an architectural constraint on your application that naturally enforces order and explicit design.


## Hub API
`subscribe( message [, subscriber ] )`

`unsubscribe( message, subscriber )`

`emit( message, payload )`