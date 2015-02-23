module.exports = wildcard = {
  /**
    * Given a pattern containing optional wildcard (*) characters,
    * returns a regular expression pattern with the wildcard replaced
    * with `\w*`.
    * 
    * @param {String} pattern - A string containing optional wildcards (`*`).
    * @returns {RegExp} - A regular expression that only matches
    *   strings that match the whole pattern from beginning to end.
    */
  toRegex: function( pattern ) {
    return new RegExp( '^' + pattern.replace( /\*/g, '[\\w:\\-]*' ) + '$' );
  }
};