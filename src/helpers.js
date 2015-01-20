module.exports = {
  matches: matches_pattern,
  unique: unique
};

/** matches_pattern( msg, pattern ) => <Boolean>
  * Checks if the `message` matches the `signal_pattern`.
  * 
  * Wildcards are translated to `\w*` regexp patterns.
  */
function matches_pattern( message, signal_pattern ) {
  var pattern = signal_pattern.replace( /\*/g, '\\w*' );

  return new RegExp( '^' + pattern + '$' ).test( message );
}

/**
  * Returns all the unique elements in an array.
  */
function unique( arr ) {
  var result = [];
  var len = arr.length;
  var i;

  for ( i = 0; i < len; i++ ) {
    if ( result.indexOf( arr[i] ) < 0 ) {
      result.push( arr[i] );
    }
  }

  return result;
}