var Subscriber = require( './sub' )
  , matches = require( './helpers' ).matches
  , unique = require( './helpers' ).unique;

/** 
  * A hub is an event manager that routes events and their
  * associated payloads to the modules subscribed to those
  * events.
  */
module.exports = function Hub() {

  var hub = Object.create( null )

    // Mapping of messages -> subscribers
    , _subscribers = Object.create( null );


  /** 
    * Stops routing messages of type <`module`:`signal`> to the subscriber.
    */
  hub.unsubscribe = function( messages, sub ) {

  };

  /** 
    * Sends the payload to all subscribers of the signal
    */
  hub.emit = function( message, payload ) {

    var matching_subs = []
      , all_patterns = Object.keys( _subscribers )
      , matching_patterns = all_patterns.filter( function( pattern ) {
          return matches( message, pattern );
        })

    /** Don't allow wildcards in emissions.
      * The main purpose of this is to force all emitted signals to be
      * explicit. This is more so that the logic of what's happening is
      * apparent and the message gets sent to its intended recipients. 
      *
      * Much like a building/zip can receive a lot mail for different recipients.
      * But in order to send mail, you have to be explicit about who it is for.
      */
    if ( message.indexOf( '*' ) != -1 ) {
      throw Error( 'Wildcard patterns are not allowed in emissions' )
    }

    // Gather all the matching subscribers into one array
    for ( var i = 0, key; i < matching_patterns.length; i++ ) {
      key = matching_patterns[i];
      matching_subs = matching_subs.concat( _subscribers[key] )
    }

    // Filter out duplicates
    matching_subs = unique( matching_subs );

    // Send the message to each subscriber
    for ( var i = 0; i < matching_subs.length; i++ ) {
      matching_subs[i].receive( message, payload );
    }
  };

  /** 
    * Registers the `sub` to receive all signals of type `message`.
    */
  hub.subscribe = function( messages, sub ) {

    var subs, message;

    sub = Subscriber( hub, sub );

    if ( typeof messages === 'string' ) {
      messages = [ messages ];
    }

    if ( !( messages instanceof Array ) ) {
      throw new Error( '`message` must be either a message string or an array of messages' );
    }

    // Loop through each message and register the sub to the _subscribers object.
    for ( var i = 0, len = messages.length; i < len; i++ ) {

      message = messages[i];

      /** A module/signal is either multple word characters or 
        * zero or more word characters followed by a star (*) which 
        * acts as a wild card. 
        *
        * Only one wildcard is allowed in each part.
        * 
        * The module and signal are separated by a colon.
        */
      if ( ! /^(\w+|\w*\*)\:(\w+|\w*\*)$/.test( message ) ) {
        throw new Error( '`message` arg must be in proper form "<module>:<signal>"' )
      }

      subs = _subscribers[ message ];

      /** First check if there is a mapping from the message to a subscribers list.
        * If so, then add our sub only if it is not already part of the list.
        */
      if ( subs ) {
        if ( subs.indexOf( sub ) < 0 ) {
          subs.push( sub );
        } 
      }
      else {
        _subscribers[ message ] = [ sub ];
      }
    }

    return sub;
  };

  return hub;

};