var minimatch = require( 'minimatch' );

module.exports = function globToRegex( pattern ) {
  return minimatch.makeRe(pattern);
};