var assert = require( 'assert' );
var wildcard = require( '../../src/utils/wildcard' );

describe( 'wildcard.toRegex(pattern)', function() {

  it( 'throws an error if the `pattern` argument is not a String', function()  {
    assert.throws( function() {
      wildcard.toRegex( {} );
    });

    assert.throws( function() {
      wildcard.toRegex( undefined );
    });
  });

  it( 'returns a RegExp object', function() {
    var result = wildcard.toRegex( 'hello world' );

    assert( result instanceof RegExp );
  });

  it( 'matches when given explicit strings', function() {
    var str = 'hello world';

    assert( str.match( wildcard.toRegex(str) ) );
  });

  describe( 'given a wildcard', function() {

    it( 'matches even when the wildcard matches zero characters', function() {
      var pattern = 'hello* world';
      var str = 'hello world';

      assert( str.match( wildcard.toRegex( pattern ) ) );
    });

    it( 'matches when the wildcard matches one character', function() {
      var pattern = 'hell* world';
      var str = 'hello world';

      assert( str.match( wildcard.toRegex( pattern ) ) );
    });

    it( 'matches when the wildcard matches more than one character', function() {
      var pattern = 'h* world';
      var str = 'hello world';

      assert( str.match( wildcard.toRegex( pattern ) ) );
    });
  });

});