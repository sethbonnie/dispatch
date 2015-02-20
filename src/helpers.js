module.exports = {
  matches: matches_pattern,
  unique: unique
};

/**
  * Checks if the `message` matches the `pattern`.
  * 
  * @param {string} message - A plain string message
  * @param {string} pattern - A string containing an optional wildcard characters ('*').
  * @returns {boolean} 
  */
function matches_pattern( message, pattern ) {
  // Translate the wildcard to match any word characters.
  var regex = new RegExp( '^' + pattern.replace( /\*/g, '\\w*' ) + '$' );

  return regex.test( message );
}

/**
  * Returns all the unique elements in an array.
  * @param {Array} arr - An array with possible duplicate elements.
  * @returns {Array} A new array with duplicate elements removed.
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