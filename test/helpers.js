var assert  = require( 'assert' );
var matches = require( '../src/helpers' ).matches;

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