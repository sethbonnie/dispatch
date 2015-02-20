var assert  = require( 'assert' );
var unique  = require( '../src/utils/unique' );
var matches = require( '../src/helpers' ).matches;

describe( 'unique( array )', function() {

  it( 'returns an equivalent array if the array contained no duplicates', function() {
    var arr = [1,2,3];

    assert.deepEqual( unique(arr), arr );
  });

  it( 'returns an array with duplicates removes', function() {
    var arr = [1,1,2,3,3,4,5,5];

    assert.deepEqual( unique( arr ), [1,2,3,4,5] );
  });

  it( 'removes duplicates of objects', function() {
    var obj1 = { foo: 1 };
    var obj2 = { foo: 2 };
    var obj3 = { foo: 3 };
    var obj4 = obj2;

    var arr = [obj1, obj2, obj3, obj4, obj1];

    assert.deepEqual( unique( arr ), [obj1,obj2,obj3] );
  });

});

describe( 'matches( message, signal)', function() {

  it( 'fails when the message has spaces', function() {
    var message = 'menu: click';
    var pattern = '*:*';

    assert.notEqual( true, matches( message, pattern ) );
  });

  it( 'matches any correctly formatted message when a `*:*` pattern is given', function() {
    var msg1 = 'menu:open';
    var msg2 = 'store:updated';
    var msg3 = 'menu:close';
    var pattern = '*:*';

    assert( matches( msg1, pattern ) );
    assert( matches( msg2, pattern ) );
    assert( matches( msg3, pattern ) );
  });

  it( 'matches when pattern has a wildcard suffix', function() {
    var msg = 'menu:close';

    assert( matches( msg, '*:close' ) );
    assert( matches( msg, 'me*:close' ) );
    assert( matches( msg, 'menu:*' ) );
    assert( matches( msg, 'menu:cl*' ) );
    assert( matches( msg, 'menu*:close*' ) );
  });

  it( 'fails with wildcards in the message', function() {
    var msg = '*:click';

    assert( !matches( msg, 'button:click' ) );
    assert( !matches( msg, '*:click' ) );
    assert( !matches( msg, '*:*' ) );
  });

  it( 'matches messages when no wildcards are present', function() {
    assert( matches( 'button:click', 'button:click' ) );
  });

});