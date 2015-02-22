var assert = require( 'assert' );
var sinon  = require( 'sinon' );
var Hub    = require( '../src/hub' );

describe( 'Hub#sub( message [, subscriber] )', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  });

  it( 'returns a subscriber', function() {
    var sub = hub.sub( 'module:signal' );

    assert.equal( typeof sub.receive, 'function' );
  });

  describe( 'when a subscriber argument is given', function() {

    it( 'returns the same subscriber', function() {
      var sub1 = hub.sub( 'module:signal1' );
      var sub2 = hub.sub( 'module:signal2', sub1 );
      var sub3 = hub.sub( 'module:signal3' );

      assert.strictEqual( sub1, sub2 );
      assert.notStrictEqual( sub1, sub3 );
    });
  });

  describe( 'when `message` is not a string or an array of strings', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.sub( undefined );
      });

      assert.throws( function() {
        hub.sub( {} );
      });
    });
  });

  describe( 'when a `message` is not in `<module>:<signal>` format', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.sub( 'just a plain string' );
      });

      assert.throws( function() {
        hub.sub( ['message1', 'message2'] );
      });
    });
  });

  describe( 'if more than one wildcard is given at the end of the module part', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.sub( 'mod**:signal' );
      });
    });
  });

  describe( 'when more than one wildcard is given at the end of a signal', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.sub( 'module:s**' );
      });
    });
  });

  describe( 'if a wildcard is not the last character of a module', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.sub( 'm*dule:signal' );
      });
    });
  });

  describe( 'if a wildcard is not the last character of a signal', function() {

    it( 'throws an error ', function() {

      assert.throws( function() {
        hub.sub( 'module:s*gnal' );
      });

    });
  });

  describe( 'when a <module> of type "*" is given', function() {

    it( 'subscribes to all messages of type <signal> ', function() {
      var click_handler = hub.sub( '*:click' );

      sinon.spy( click_handler, 'receive' );

      hub.dispatch( 'button:click' );
      hub.dispatch( 'link:click' );

      assert( click_handler.receive.calledTwice );
    });
  });

  describe( 'when a <signal> of type "*" is given', function() {

    it( 'subscribes to all messages of a <module> ', function() {
      var menu_events_handler = hub.sub( 'menu:*' );

      sinon.spy( menu_events_handler, 'receive' );

      hub.dispatch( 'menu:toggle' );
      hub.dispatch( 'menu:open' );
      hub.dispatch( 'menu:close' );

      assert( menu_events_handler.receive.calledThrice );
    });
  });

  describe( 'when array is given as the `message` argument', function() {

    it( 'subscribes to multiple messages ', function() {
      var sub = hub.sub(['menu:open', 'menu:close']);

      sinon.spy( sub, 'receive' );

      hub.dispatch( 'menu:toggle' );
      hub.dispatch( 'menu:open' );
      hub.dispatch( 'menu:close' );

      assert( sub.receive.calledTwice );
    });
  });

});

describe( 'Hub#dispatch( message, payload )', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  });

  it( 'sends the `message` and `payload` to each subscribed module', function() {
    var sub1 = hub.sub( 'menu:open' );
    var sub2 = hub.sub( 'menu:open' );

    sinon.spy( sub1, 'receive' );
    sinon.spy( sub2, 'receive' );

    hub.dispatch( 'menu:open', { foo: 'bar' } );

    assert( sub1.receive.calledWith( 'menu:open', { foo: 'bar' }));
    assert( sub2.receive.calledWith( 'menu:open', { foo: 'bar' }));
  });

  it( 'sends the `message` and `payload` to subcribers of wildcards', function() {
    var sub = hub.sub( 'menu:*' );

    sinon.spy( sub, 'receive' );

    hub.dispatch( 'menu:open', { foo: 'bar' } );

    assert( sub.receive.calledWith( 'menu:open', { foo: 'bar' }) );
  });

  describe( 'when a subscriber subscribes to overlapping patterns', function() {

    it( 'only sends a message to a sub once per emission', function() {
      var sub = hub.sub( 'menu:*' );

      sinon.spy( sub, 'receive' );

      hub.sub( 'menu:open', sub );

      // open matches twice but should generate just one emission
      hub.dispatch( 'menu:open', { foo: 'bar' } );
      hub.dispatch( 'menu:close', { foo: 'baz' } );

      assert( sub.receive.calledTwice );
    });
  });

  it( "doesn't send messages to subscribers that aren't subscribed", function() {
    var sub1 = hub.sub( 'menu:cl' );
    var sub2 = hub.sub( 'menu:close' );

    sinon.spy( sub1, 'receive' );
    sinon.spy( sub2, 'receive' );

    hub.dispatch( 'menu:click', { cash: 'money' } );

    assert( !sub1.receive.called );
    assert( !sub2.receive.called );
  });

  describe( 'when a subscriber unsubscribes', function() {

    it( "stops sending messages to that subscriber", function() {
      var sub = hub.sub( 'menu:open' );

      sinon.spy( sub, 'receive' );

      hub.dispatch( 'menu:open' );
      hub.unsub( 'menu:open', sub );
      hub.dispatch( 'menu:open' );

      assert( sub.receive.calledOnce );
    });
  });

  describe( 'when given a "*" pattern as a message', function() {
  
    it( 'throws an error', function() {

      assert.throws( function() {
        hub.dispatch( '*:signal', 'payload' );
      });

      assert.throws( function() {
        hub.dispatch( 'module:*', 'payload' );
      });

      assert.throws( function() {
        hub.dispatch( '*:*', 'payload' );
      });
    });
  });
});


describe( 'Hub#unsub( messages, sub )', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  });

  it( 'stops sending `sub` `messages` of the given type', function() {
    var sub = hub.sub( ['menu:open', 'menu:close', 'modal:open'] );
    
    sinon.spy( sub, 'receive' );

    hub.unsub( 'menu:open', sub );

    hub.dispatch( 'menu:open' );
    hub.dispatch( 'modal:open' );
    hub.dispatch( 'menu:close' );

    assert.equal( sub.receive.callCount, 2 );
  });

  describe( 'when `sub` argument is not passed in', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.unsub( 'module:signal' );
      });
    });
  });

  describe( 'when one sub unsubscribes from a message', function() {
    
    it( 'should not unsub any other subscribers', function() {
      var sub1 = hub.sub( 'menu:open' );
      var sub2 = hub.sub( 'menu:open' );

      sinon.spy( sub1, 'receive' );
      sinon.spy( sub2, 'receive' );

      hub.unsub( 'menu:open', sub1 );
      hub.dispatch( 'menu:open' );

      assert.equal( sub1.receive.callCount, 0 );
      assert.equal( sub2.receive.callCount, 1 );
    });
  });

  describe( 'when `message` is not a string or an array of messages', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.unsub( undefined );
      });

      assert.throws( function() {
        hub.unsub( {} );
      });
    });
  });

  describe( 'when `message` is not in `<module>:<signal>` format', function() {
    it( 'throws an error', function() {
      assert.throws( function() {
        hub.unsub( 'just a plain string' );
      });

      assert.throws( function() {
        hub.unsub( ['message1', 'message2'] );
      });
    });
  });

  describe( 'when given a message value of `*:*`', function() {

    it( 'unsubscribes from all messages', function() {
      var sub = hub.sub( ['menu:open', 'modal:open', 'button:click'] );
      
      sinon.spy( sub, 'receive' );

      hub.unsub( '*:*', sub );
      hub.dispatch( 'menu:open' );
      hub.dispatch( 'modal:open', { type: 'mastery-trees' } );
      hub.dispatch( 'button:click' );

      assert.equal( sub.receive.callCount, 0 );
    });
  });

  describe( 'when a <signal> of type "*" is given', function() {

    it( 'unsubscribes from all messages of a given <module>', function() {
      var sub = hub.sub( ['menu:open', 'menu:close'] );
      
      sinon.spy( sub, 'receive' );

      hub.unsub( 'menu:*', sub );
      hub.dispatch( 'menu:open' );
      hub.dispatch( 'menu:close' );

      assert.equal( sub.receive.callCount, 0 );
    });
  });

  describe( 'when the <module> part is a wildcard', function() {

    it( 'unsubscribes from all messages of type <signal>', function() {
      var sub = hub.sub( ['menu:open', 'modal:open'] );
      
      sinon.spy( sub, 'receive' );

      hub.unsub( '*:open', sub );
      hub.dispatch( 'modal:open' );
      hub.dispatch( 'menu:open' );

      assert.equal( sub.receive.callCount, 0 );
    });
  });
});