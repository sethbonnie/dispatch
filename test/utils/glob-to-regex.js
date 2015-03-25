var assert = require( 'assert' );
var globToRegex = require( '../../src/utils/glob-to-regex' );

/**
  * Match the behavior specified by UNIX shells as in the 
  * common features table on:
  *   http://en.wikipedia.org/wiki/Glob_%28programming%29
  */

describe( '?', function() {
  it( 'matches exactly one unkown characters', function() {
    var pattern = '?at';
    var shouldMatch = [ 'Cat', 'Bat', 'bat', 'cat' ];
    var shouldNotMatch = [ 'at' ];

    shouldMatch.forEach( function( str ) {
      assert( str.match( globToRegex( pattern ) ) );
    });

    shouldNotMatch.forEach( function( str ) {
      assert( !str.match( globToRegex( pattern ) ) );
    });
  });
});

describe( '*', function() {
  it( 'matches any number of known chars from its pos to the end', function() {
    var pattern = 'Law*';
    var shouldMatch = [ 'Law', 'Laws', 'Lawyer' ];

    shouldMatch.forEach( function( str ) {
      assert( str.match( globToRegex( pattern ) ) );
    });
  });

  it( 'matches any number of known chars including start or multiple', function() {
    var pattern = '*Law*';
    var shouldMatch = [ 'Law', 'GrokLaw', 'Lawyer' ];

    shouldMatch.forEach( function( str ) {
      assert( str.match( globToRegex( pattern ) ) );
    });
  });
});

describe( '[<characters>]', function() {
  it( 'matches a character as part of a group of characters', function() {
    var pattern = '[CB]at';
    var shouldMatch = [ 'Bat', 'Cat' ];
    var shouldNotMatch = [ 'bat', 'cat' ];

    shouldMatch.forEach( function( str ) {
      assert( str.match( globToRegex( pattern ) ) );
    });

    shouldNotMatch.forEach( function( str ) {
      assert( !str.match( globToRegex( pattern ) ) );
    });
  });
});

describe( '[!<characters>]', function() {
  it(  'matches any characters but the ones specified', function() {
    var pattern = '[!CP]at';
    var shouldMatch = [ 'Bat', 'bat', 'cat' ];
    var shouldNotMatch = [ 'Pat', 'Cat' ];

    shouldMatch.forEach( function( str ) {
      assert( str.match( globToRegex( pattern ) ) );
    });

    shouldNotMatch.forEach( function( str ) {
      assert( !str.match( globToRegex( pattern ) ) );
    });
  });
});