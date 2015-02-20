var assert = require( 'assert' );
var gc = require( '../ground-control.js' );

describe( 'ground-control', function() {

  it( 'provides a hub() method', function() {
    assert.equal( typeof gc.hub, 'function' );
  });

  describe( '.hub()', function() {

    it( 'returns a hub instance', function() {
      // A hub is an object that adheres to the hub api:
      //  .emit(), .subscribe(), .unsubscribe()
      var hub = gc.hub();

      assert.equal( typeof hub.dispatch, 'function' );
      assert.equal( typeof hub.sub, 'function' );
      assert.equal( typeof hub.unsub, 'function' );
    });

    describe( 'when called multiple times', function() {

      it( 'returns different hub instances', function() {
        var hub1 = gc.hub();
        var hub2 = gc.hub();

        assert( hub1 !== hub2 );
      });
    });
  });
});