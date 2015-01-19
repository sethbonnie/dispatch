var assert = require( 'assert' );
var Dispatch = require( '../src/index' );

describe( 'Dispatch', function() {

  it( 'provides a hub() method', function() {
    assert.equal( typeof Dispatch.hub, 'function' );
  });

  describe( '.hub()', function() {

    it( 'returns a hub instance', function() {
      // A hub is an object that adheres to the hub api:
      //  .emit(), .subscribe(), .unsubscribe()
      var hub = Dispatch.hub();

      assert.equal( typeof hub.emit, 'function' );
      assert.equal( typeof hub.subscribe, 'function' );
      assert.equal( typeof hub.unsubscribe, 'function' );
    });

    describe( 'when called multiple times', function() {

      it( 'returns different hub instances', function() {
        var hub1 = Dispatch.hub();
        var hub2 = Dispatch.hub();

        assert( hub1 !== hub2 );
      });
    });
  });
});