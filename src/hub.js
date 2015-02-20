var Subscriber = require( './sub' );
var matches = require( './helpers' ).matches;
var unique = require( './utils/unique' );

/** 
  * A hub is an event manager that routes messages and their
  * associated payloads to the subscribers listening for those
  * messages.
  *
  * @returns A hub object.
  */
module.exports = function Hub() {

  var hub = Object.create( null );

  // Mapping of messages -> subscribers
  var _subscribers = Object.create( null );


  /** 
    * Stops routing messages of type <`module`:`signal`> to the subscriber.
    * 
    * @param {String|Array} messages - A message or array of messages that the 
    *   `subscriber` no longer wishes to listen for.
    * @param {Function} subscriber - The function that was passed to the `subscribe()` 
    *   method.
    *
    * @returns {undefined}
    */
  hub.unsub = function( messages, subscriber ) {
    var matches_pattern = function( key ) {
          return pattern.test( key );
        };
    var matching_keys = [];
    var patterns = Object.keys( _subscribers );
    var subs;
    var pattern;
    var i;
    var len;

    if ( !subscriber ) {
      throw new Error( '`subscriber` cannot be `undefined`' );
    }
    else if ( typeof subscriber.receive !== 'function' ) {
      throw new Error( '`subscriber` must implement a `receive()` method' );
    }

    if ( typeof messages === 'string' ) {
      messages = [ messages ];
    }

    if ( !( messages instanceof Array ) ) {
      throw new Error( 
        '`messages` must be either a message string or an array of messages' );
    }

    /**
      * Loop through each message and unregister the subscriber from the _subscribers 
      * object.
      */ 
    for ( i = 0, len = messages.length; i < len; i++ ) {

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

      matching_keys = matching_keys.concat( patterns.filter( matches_pattern ) );
    }

    // Filter out duplicate keys
    matching_keys = unique( matching_keys );

    // Iterate through each matching key and remove the sub if it exists
    for ( i = 0, len = matching_keys.length; i < len; i++ ) {
      subs = _subscribers[ matching_keys[i] ];

      if ( subs && subs.indexOf( subscriber ) > -1 ) {
        subs.splice( subs.indexOf( subscriber ), 1 );
      }

      // If no more subscribers are registered under the key, delete it
      if ( subs.length === 0 ) {
        delete _subscribers[ matching_keys[i] ];
      }
    }
  };

  /** 
    * Sends the payload to all subscribers of the signal
    * 
    * @param {string} message - The message to send to each subscriber. This
    *   string should contain any wildcard characters. This akin to how an 
    *   office building might receive a lot mail for different recipients, yet 
    *   in order for the mail to actually get to the recipient, the sender 
    *   has to be explicit about who it is for.
    * @param {any} payload - The data to send to each subscriber.
    *
    * @returns {undefined}
    */
  hub.dispatch = function( message, payload ) {

    var matching_subs = [];
    var all_patterns = Object.keys( _subscribers );

    var matching_patterns = all_patterns.filter( function( pattern ) {
          return matches( message, pattern );
        });

    var key;
    var i;

    // Don't allow wildcards in emissions.
    if ( message.indexOf( '*' ) != -1 ) {
      throw Error( 'Wildcard patterns are not allowed in emissions' );
    }

    // Gather all the matching subscribers into one array
    for ( i = 0; i < matching_patterns.length; i++ ) {
      key = matching_patterns[i];
      matching_subs = matching_subs.concat( _subscribers[key] );
    }

    // Filter out duplicates
    matching_subs = unique( matching_subs );

    // Send the message to each subscriber
    for ( i = 0; i < matching_subs.length; i++ ) {
      matching_subs[i].receive( message, payload );
    }

  };

  /** 
    * Registers the `sub` to receive all signals of type `message`.
    * @param {String|Array} messages - A message or array of messages that the 
    *   `subscriber` wishes to receive.
    * @param {Function} subscriber - The function that will be the recipient of each
    *   subscribed message and its associated payload.
    * @returns {undefined}
    */
  hub.sub = function( messages, subscriber ) {

    var message;
    var subs;
    var len;
    var i;

    subscriber = Subscriber( subscriber );

    if ( typeof messages === 'string' ) {
      messages = [ messages ];
    }

    if ( !( messages instanceof Array ) ) {
      throw new Error( 
        '`message` must be either a message string or an array of messages' );
    }

    // Loop through each message and register the sub to the _subscribers object.
    for ( i = 0, len = messages.length; i < len; i++ ) {

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
        * list; if one exists, add our subscriber if it's not already part of the list.
        * If there is no mapping then create a new list.
        */
      if ( subs ) {
        if ( subs.indexOf( subscriber ) < 0 ) {
          subs.push( subscriber );
        } 
      }
      else {
        _subscribers[ message ] = [ subscriber ];
      }
    }

    return subscriber;
  };

  return hub;

};