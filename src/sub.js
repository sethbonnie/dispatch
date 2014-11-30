/** Creates a subscriber object.
  * If a subscriber is passed in, decorates it with
  * the receive() and ignore() methods if they don't
  * already exist.
  */
module.exports = function( hub, subscriber ) {
  var sub = subscriber || Object.create( null );

  if ( !hub || typeof hub._unsubscribe !== 'function' ) {
    console.log( hub );
    throw TypeError( 'A hub needs to passed in as the first argument' );
  }

  // This method is meant to be overwritten
  if ( !sub.receive ) {
    sub.receive = function( signal, payload ) {};
  }

  sub.ignore = function( signal ) {
    hub._unsubscribe( sub, signal );
  }

  return sub;

}