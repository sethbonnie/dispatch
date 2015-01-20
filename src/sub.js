/** Creates a subscriber object.
  * If a subscriber is passed in, decorates it with
  * the receive() and ignore() methods if they don't
  * already exist.
  */
module.exports = function( subscriber ) {
  var sub = subscriber || Object.create( null );
  
  // This method is meant to be overwritten
  if ( !sub.receive ) {
    sub.receive = function( signal, payload ) {};
  }

  return sub;

};