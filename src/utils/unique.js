/**
  * Returns all the unique elements in an array.
  * @param {Array} arr - An array with possible duplicate elements.
  * @returns {Array} A new array with duplicate elements removed.
  */
module.exports = function unique( arr ) {
  var result = [];
  var len = arr.length;
  var i;

  for ( i = 0; i < len; i++ ) {
    if ( result.indexOf( arr[i] ) < 0 ) {
      result.push( arr[i] );
    }
  }

  return result;
};