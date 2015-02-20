/** 
  * Creates a subscriber object. If a subscriber is passed in, 
  * decorates it with the `receive()` method if it doesn't already exist.
  *
  * @param {Object} subscriber - An optional subscriber.
  * @returns {Object} A subscriber object with a `receive()` method.
  */
module.exports = function( subscriber ) {
  var sub = subscriber || Object.create( null );
  
  // This method is meant to be overwritten
  if ( !sub.receive ) {
    sub.receive = function( signal, payload ) {};
  }

  return sub;

};