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
    var matching_keys = [];
    var patterns = Object.keys( _subscribers );
    var subs;
    var message;
    var pattern;

    if ( !sub ) {
      throw new Error( '`sub` cannot be `undefined`' )
    }
    else if ( typeof sub.receive !== 'function' ) {
      throw new Error( '`sub` must implement a `receive()` method' )
    }

    if ( typeof messages === 'string' ) {
      messages = [ messages ];
    }

    if ( !( messages instanceof Array ) ) {
      throw new Error( 
        '`messages` must be either a message string or an array of messages' );
    }

    /**
      * Loop through each message and unregister the sub from the _subscribers 
      * object.
      */ 
    for ( var i = 0, len = messages.length; i < len; i++ ) {

      /** A module/signal is either multple word characters or 
        * zero or more word characters followed by a star (*) which 
        * acts as a wild card. 
        *
        * Only one wildcard is allowed in each part.
        * 
        * The module and signal are separated by a colon.
        */
      if ( ! /^(\w+|\w*\*)\:(\w+|\w*\*)$/.test( messages[i] ) ) {
        throw new Error( 
          '`message` arg must be in proper form "<module>:<signal>"' );
      }

      // Replace all wildcards with a `[\w*]*` regex.
      pattern = new RegExp( messages[i].replace( /\*/g, "[\\w*]*" ) );

      matching_keys = matching_keys.concat( patterns.filter( function( k ) {
        return pattern.test( k );
      }));
    }

    // Filter out duplicate keys
    matching_keys = unique( matching_keys );

    // Iterate through each matching key and remove the sub if it exists
    for ( var i = 0, len = matching_keys.length; i < len; i++ ) {
      subs = _subscribers[ matching_keys[i] ];

      if ( subs && subs.indexOf( sub ) > -1 ) {
        subs.splice( subs.indexOf( sub ), 1 );
      }

      // If no more subscribers are registered under the key, delete it
      if ( subs.length === 0 ) {
        delete _subscribers[ matching_keys[i] ];
      }
    }
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

    sub = Subscriber( sub );

    if ( typeof messages === 'string' ) {
      messages = [ messages ];
    }

    if ( !( messages instanceof Array ) ) {
      throw new Error( 
        '`message` must be either a message string or an array of messages' );
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
        throw new Error( 
          '`message` arg must be in proper form "<module>:<signal>"' );
      }

      subs = _subscribers[ message ];

      /** Check if there is a mapping from the message to a subscribers 
        * list; if one exists, add our sub if it's not already part of the list.
        * If there is no mapping then create a new list.
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