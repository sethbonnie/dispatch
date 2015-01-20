var assert = require( 'assert' );
var sinon  = require( 'sinon' );
var Subscriber = require( '../src/sub.js' );

describe( 'Subscriber( subscriber )', function() {
  
  describe( 'when `subscriber` object is not given', function() {

    it( 'returns a new `subscriber` object', function() {
      var subscriber = Subscriber();

      assert.equal( typeof subscriber, 'object' );

      assert.equal( typeof subscriber.receive, 'function' );
    });
  });

  describe( 'when `subscriber` is passed as an arg', function() {

    it( 'returns the same `subscriber`', function() {
      var subscriber = Object.create( null );

      assert.strictEqual( Subscriber( subscriber ), subscriber );
    });

    it( 'decorates `subscriber` with receive() if it does not have it', function() {
      var subscriber = Object.create( null );

      assert.equal( typeof subscriber.receive, 'undefined' );

      Subscriber(  subscriber );

      assert.equal( typeof subscriber.receive, 'function' );
    });

    it( "defers to `subscriber's receive()` method if it exists", function() {
      var subscriber = Object.create( {
        receive: function( signal, payload ) {
          return 'test';
        }
      });

      Subscriber( subscriber );
      assert.equal( subscriber.receive(), 'test' );
    });
  });
});
