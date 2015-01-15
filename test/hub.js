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

  describe( 'when a subscriber argument is given', function() {

    it( 'returns the same subscriber', function() {
      var sub1 = hub.subscribe( 'module:signal1' )
        , sub2 = hub.subscribe( 'module:signal2', sub1 )
        , sub3 = hub.subscribe( 'module:signal3' )

      assert.strictEqual( sub1, sub2 );
      assert.notStrictEqual( sub1, sub3 );
    })

  })

  describe( 'when `message` is not a string or an array of strings', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.subscribe( undefined )
      })

      assert.throws( function() {
        hub.subscribe( {} )
      })
    })

  })

  describe( 'when a `message` is not in `<module>:<signal>` format', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.subscribe( 'just a plain string' )
      })

      assert.throws( function() {
        hub.subscribe( ['message1', 'message2'] );
      })
    })

  })

  describe( 'if more than one wildcard is given at the end of the module part', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.subscribe( 'mod**:signal' );
      })

    })

  })

  describe( 'when more than one wildcard is given at the end of a signal', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.subscribe( 'module:s**' );
      })

    })

  })

  describe( 'if a wildcard is not the last character of a module', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.subscribe( 'm*dule:signal' );
      })

    })

  })

  describe( 'if a wildcard is not the last character of a signal', function() {

    it( 'throws an error ', function() {

      assert.throws( function() {
        hub.subscribe( 'module:s*gnal' );
      })

    })

  })

  describe( 'when a <module> of type "*" is given', function() {

    it( 'subscribes to all messages of type <signal> ', function() {
      var click_handler = hub.subscribe( '*:click' );

      sinon.spy( click_handler, 'receive' );

      hub.emit( 'button:click' );
      hub.emit( 'link:click' );

      assert( click_handler.receive.calledTwice );
    })

  })

  describe( 'when a <signal> of type "*" is given', function() {

    it( 'subscribes to all messages of a <module> ', function() {
      var menu_events_handler = hub.subscribe( 'menu:*' );

      sinon.spy( menu_events_handler, 'receive' );

      hub.emit( 'menu:toggle' );
      hub.emit( 'menu:open' );
      hub.emit( 'menu:close' );

      assert( menu_events_handler.receive.calledThrice );
    })

  })

  describe( 'when array is given as the `message` argument', function() {

    it( 'subscribes to multiple messages ', function() {
      var sub = hub.subscribe(['menu:open', 'menu:close'])

      sinon.spy( sub, 'receive' );

      hub.emit( 'menu:toggle' );
      hub.emit( 'menu:open' );
      hub.emit( 'menu:close' );

      assert( sub.receive.calledTwice );
    })

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

  it( 'sends the `message` and `payload` to subcribers of wildcards', function() {
    var sub = hub.subscribe( 'menu:*' );

    // spy on the receive method
    sinon.spy( sub, 'receive' );

    hub.emit( 'menu:open', { foo: 'bar' } );

    assert( sub.receive.calledWith( 'menu:open', { foo: 'bar' }))
  })

  describe( 'when a subscriber subscribes to overlapping patterns', function() {

    it( 'only sends a message to a sub once per emission', function() {
      var sub = hub.subscribe( 'menu:*' );
      hub.subscribe( 'menu:open', sub );

      sinon.spy( sub, 'receive' );

      // open matches twice but should generate just one emission
      hub.emit( 'menu:open', { foo: 'bar' } );
      hub.emit( 'menu:close', { foo: 'baz' } );

      assert( sub.receive.calledTwice )
    })

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

  describe( 'when a subscriber unsubscribes', function() {

    it( "stops sending messages to that subscriber", function() {
      var sub = hub.subscribe( 'menu:open' );

      sinon.spy( sub, 'receive' );

      hub.emit( 'menu:open' );
      hub.unsubscribe( 'menu:open', sub );
      hub.emit( 'menu:open' );

      assert( sub.receive.calledOnce );
    })

  })

  describe( 'when given a "*" pattern as a message', function() {
  
    it( 'throws an error', function() {

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

})


describe( 'Hub#unsubscribe( signal, sub )', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  })

  it( 'unsubscribes the sub from receiving messages of type `signal`' )

  describe( 'when `sub` argument is not passed in', function() {
    it( 'throws an error', function() {

      assert.throws( function() {
        hub.unsubscribe( 'module:signal' );
      });
      
    })

  })

  describe( 'when `message` is not a string or an array of messages', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.unsubscribe( undefined )
      })

      assert.throws( function() {
        hub.unsubscribe( {} )
      })
    })

  })

  describe( 'when `message` is not in `<module>:<signal>` format', function() {
    it( 'throws an error', function() {
      assert.throws( function() {
        hub.subscribe( 'just a plain string' )
      })

      assert.throws( function() {
        hub.subscribe( ['message1', 'message2'] );
      })
    })
  })

  describe( 'when given a message value of `*:*`', function() {

    it( 'unsubscribes from all messages' )

  })

  describe( 'when a <signal> of type "*" is given', function() {

    it( 'unsubscribes from all messages of a given <module>' )

  })

  describe( 'when the <module> part is a wildcard', function() {

    it( 'unsubscribes from all messages of type <signal> ' )

  })

})