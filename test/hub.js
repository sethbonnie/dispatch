var assert = require( 'assert' )
  , sinon  = require( 'sinon' )
  , Hub = require( '../src/hub' );

describe( 'Hub instance', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  })

  it( 'provides a subscribe() method', function() {
    assert.equal( typeof hub.subscribe, 'function' );
  })

  it( 'provides an emit() method', function() {
    assert.equal( typeof hub.emit, 'function' );
  })

  it( 'provides an unsubscribe() method', function() {
    assert.equal( typeof hub.unsubscribe, 'function' );
  })

})

describe( 'Hub#subscribe()', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  })

  it( 'returns a subscriber', function() {
    var sub = hub.subscribe( 'module:signal' );

    assert.equal( typeof sub.receive, 'function' );

  })

  it( 'returns the same subscriber if one is given', function() {
    var sub1 = hub.subscribe( 'module:signal1' )
      , sub2 = hub.subscribe( 'module:signal2', sub1 )
      , sub3 = hub.subscribe( 'module:signal3' )

    assert.strictEqual( sub1, sub2 );
    assert.notStrictEqual( sub1, sub3 );
  })


  it( 'throws an error if `message` is not a string or an array of strings', function() {

    assert.throws( function() {
      hub.subscribe( undefined )
    })

    assert.throws( function() {
      hub.subscribe( {} )
    })
  })

  it( 'throws an error if each `message` is not in `<module>:<signal>` format', function() {

    assert.throws( function() {
      hub.subscribe( 'just a plain string' )
    })

    assert.throws( function() {
      hub.subscribe( ['message1', 'message2'] );
    })
  })

  it( 'throws an error if more than one wildcard is given at the end of the module part', function() {

    assert.throws( function() {
      hub.subscribe( 'mod**:signal' );
    })

  })

  it( 'throws an error if more than one wildcard is given at the end of a signal', function() {

    assert.throws( function() {
      hub.subscribe( 'module:s**' );
    })

  })

  it( 'throws an error if a wildcard is not the last character of a module', function() {

    assert.throws( function() {
      hub.subscribe( 'm*dule:signal' );
    })

  })

  it( 'throws an error if a wildcard is not the last character of a signal', function() {

    assert.throws( function() {
      hub.subscribe( 'module:s*gnal' );
    })

  })

  it( 'subscribes to all signals of type <signal> when a <module> of type "*" is given', function() {
    var click_handler = hub.subscribe( '*:click' );

    sinon.spy( click_handler, 'receive' );

    hub.emit( 'button:click' );
    hub.emit( 'link:click' );

    assert( click_handler.receive.calledTwice );
  })

  it( 'subscribes to all signals of a <module> when a <signal> of type "*" is given', function() {
    var menu_events_handler = hub.subscribe( 'menu:*' );

    sinon.spy( menu_events_handler, 'receive' );

    hub.emit( 'menu:toggle' );
    hub.emit( 'menu:open' );
    hub.emit( 'menu:close' );

    assert( menu_events_handler.receive.calledThrice );
  })

  it( 'subscribes to multiple messages when array is given as the `message` argument', function() {
    var sub = hub.subscribe(['menu:open', 'menu:close'])

    sinon.spy( sub, 'receive' );

    hub.emit( 'menu:toggle' );
    hub.emit( 'menu:open' );
    hub.emit( 'menu:close' );

    assert( sub.receive.calledTwice );
  })

})

describe( 'Hub#emit()', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  })

  it( 'sends the `message` and `payload` to each subscribed module', function() {
    var sub1 = hub.subscribe( 'menu:open' )
      , sub2 = hub.subscribe( 'menu:open' );

    // spy on the receive method
    sinon.spy( sub1, 'receive' );
    sinon.spy( sub2, 'receive' );

    hub.emit( 'menu:open', { foo: 'bar' } );

    assert( sub1.receive.calledWith( 'menu:open', { foo: 'bar' }))
    assert( sub2.receive.calledWith( 'menu:open', { foo: 'bar' }))
  });

  it( 'sends the `message` and `payload` to subcribers of wildcard patterns', function() {
    var sub = hub.subscribe( 'menu:*' );

    // spy on the receive method
    sinon.spy( sub, 'receive' );

    hub.emit( 'menu:open', { foo: 'bar' } );

    assert( sub.receive.calledWith( 'menu:open', { foo: 'bar' }))
  })

  it( 'only sends a message to a sub once per emission regardless of multiple subscriptions', function() {
    var sub = hub.subscribe( 'menu:*' );
    hub.subscribe( 'menu:open', sub );

    sinon.spy( sub, 'receive' );

    // open matches twice but should generate just one emission
    hub.emit( 'menu:open', { foo: 'bar' } );
    hub.emit( 'menu:close', { foo: 'baz' } );

    assert( sub.receive.calledTwice )
  })

  it( "doesn't send messages to subscribers that aren't subscribed", function() {
    var sub1 = hub.subscribe( 'menu:cl' )
      , sub2 = hub.subscribe( 'menu:close' )

    sinon.spy( sub1, 'receive' )
    sinon.spy( sub2, 'receive' )

    hub.emit( 'menu:click', { cash: 'money' } )

    assert( !sub1.receive.called )
    assert( !sub2.receive.called )
  })


  it( "stops sending messages once the a subscriber unsubscribes", function() {
    var sub = hub.subscribe( 'menu:open' );

    sinon.spy( sub, 'receive' );

    hub.emit( 'menu:open' );
    hub.unsubscribe( 'menu:open', sub );
    hub.emit( 'menu:open' );

    assert( sub.receive.calledOnce );
  })

  
  it( 'throws an error if passed a "*" pattern as a signal', function() {

    assert.throws( function() {
      hub.emit( '*:signal', 'payload' );
    })

    assert.throws( function() {
      hub.emit( 'module:*', 'payload' );
    })

    assert.throws( function() {
      hub.emit( '*:*', 'payload' );
    })
  });

})


describe( 'Hub#unsubscribe( signal, sub )', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  })

  it( 'throws an error if `message` is not a string or an array of strings' )

  it( 'throws an error if each `message` is not in `<module>:<signal>` format' )

  it( 'unsubscribes the sub from receiving messages of type `signal`' )

  it( 'unsubscribes from all signals if given a message value of `*:*`' )

  it( 'unsubscribes from all signals of a <module> when a <signal> of type "*" is given' )

  it( 'unsubscribes from all signals of type <signal> when the <module> part is a wildcard' )

})