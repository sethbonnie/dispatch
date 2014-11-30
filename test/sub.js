var assert = require( 'assert' )
  , Subscriber = require( '../src/sub.js' );

describe( 'subscriber constructor', function() {
  var hub = { _unsubscribe: function() {} };

  it( "requires a hub as it's first argument", function() {
    var hub = undefined;

    /** According to our definition of a hub, it's an object that
      * provides the listen(), emit(), and a _unsubscribe method().
      * But to a subscriber, the only thing that matters is that
      * it provides an _unsubscribe method().
      */

    assert.throws( function() {
      Subscriber( hub ); // undefined
    })

    hub = {};
    assert.throws( function() {
      Subscriber( hub );  // empty object
    })

    hub = {
      _unsubscribe: function() {}
    };
    assert.ok( Subscriber( hub ) );

  })

  it( "returns a new subscriber object if one wasn't passed in", function() {
    var subscriber = Subscriber( hub );

    assert.equal( typeof subscriber, 'object' );

    assert.equal( typeof subscriber.receive, 'function' );
    assert.equal( typeof subscriber.ignore, 'function' );

  });

  it( "returns the same subscriber object that was passed in", function() {
    var subscriber = Object.create( null );

    assert.strictEqual( Subscriber( hub, subscriber ), subscriber );

  });

  it( "decorates subscriber with receive() if it doesn't have it", function() {
    var subscriber = Object.create( null );

    Subscriber( hub, subscriber );

    assert.equal( typeof subscriber.receive, 'function' );

  });

  it( "defers to the subscriber's receive() method if it exists", function() {
    var subscriber = Object.create( {
      receive: function( signal, payload ) {
        return 'test';
      }
    });

    Subscriber( hub, subscriber );
    assert.equal( subscriber.receive(), 'test' );

  })

  it( "overrides subscriber's ignore() method even it exists", function() {
    var subscriber = Object.create( {
      ignore: function( signal ) {
        return 'test';
      }
    });

    Subscriber( hub, subscriber );
    assert.notEqual( subscriber.ignore(), 'test' );
  })

})