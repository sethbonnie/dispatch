module.exports = wildcard = {
  /**
    * Given a pattern containing optional wildcard (*) characters,
    * returns a regular expression pattern with the wildcard replaced
    * with word characters (`\w`), spaces (`\s`), colons (`:`) and the
    * dash character (`-`).
    * 
    * @param {String} pattern - A string containing optional wildcards (`*`).
    * @returns {RegExp} - A regular expression that only matches
    *   strings that match the whole pattern from beginning to end.
    */
  toRegex: function( pattern ) {
    return new RegExp( '^' + pattern.replace( /\*/g, '[\\w:\\-\\s]*' ) + '$' );
  }
};