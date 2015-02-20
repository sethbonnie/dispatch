module.exports = {
  matches: matches_pattern
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

