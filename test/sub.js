var assert = require( 'assert' );
var Subscriber = require( '../src/sub.js' );

describe( 'Subscriber constructor', function() {
  var hub = { unsubscribe: function() {} };

  it( "requires a hub as it's first argument", function() {

    /** According to our definition of a hub, it's an object that
      * provides the listen(), emit(), and a unsubscribe method().
      * But to a subscriber, the only thing that matters is that
      * it provides an unsubscribe method().
      */

    assert.throws( function() {
      Subscriber( undefined ); // undefined
    });

    assert.throws( function() {
      Subscriber( {} );  // empty object
    });

    assert.ok( Subscriber( hub ) );
  });

  it( "returns a new subscriber object if one wasn't passed in", function() {
    var subscriber = Subscriber( hub );

    assert.equal( typeof subscriber, 'object' );

    assert.equal( typeof subscriber.receive, 'function' );
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
  });
});