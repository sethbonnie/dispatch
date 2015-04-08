var unique = require( './utils/unique' );
var globToRegex = require( './utils/glob-to-regex' );

require("setimmediate");

/** 
  * A hub is an event manager that routes messages and their
  * associated payloads to the subscribers listening for those
  * messages.
  * @constructor
  * @returns A hub object.
  */
global.PubHub = module.exports = function Hub() {

  var hub = Object.create( null );

  // Mapping of messages -> subscribers
  var _subscribers = Object.create( null );


  /** Hub#dispatch( message, payload )
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

    var matchingSubs = [];
    var subscriberMessages = Object.keys( _subscribers );

    var matchingPatterns;
    var key;
    var i;

    // Don't allow wildcards in emissions.
    if ( message.indexOf( '*' ) != -1 ) {
      throw Error( 'Wildcard patterns are not allowed in emissions' );
    }

    matchingPatterns = subscriberMessages.filter( function( pattern ) {
      return globToRegex( pattern ).test( message );
    });

    // Gather all the matching subscribers into one array
    for ( i = 0; i < matchingPatterns.length; i++ ) {
      key = matchingPatterns[i];
      matchingSubs = matchingSubs.concat( _subscribers[key].subs );

      // Cache the message
      _subscribers[key].cached = {
        message: message,
        payload: payload
      };
    }

    // Filter out duplicates
    matchingSubs = unique( matchingSubs );

    // Send the message to each subscriber
    for ( i = 0; i < matchingSubs.length; i++ ) {
      (function(fn, msg, pay ) {
        setImmediate( function() {
          fn( msg, pay );
        });
      })( matchingSubs[i], message, payload )
    }

    return hub;
  };


  /** Hub#sub( message(s), subscriber )
    * Registers the `sub` to receive all signals of type `message`.
    * @param {String|Array} messages - A message pattern or array of messages that the 
    *   `subscriber` wishes to receive. Each message can have any number of wildcards
    *   which will match zero or more word-like characters.
    * @param {Function} subscriber - The function that will be the recipient of each
    *   subscribed message and its associated payload.
    * @returns {undefined}
    */
  hub.sub = function( messages, subscriber ) {
    var message;
    var matchingSubs;
    var cached;
    var len;
    var i;

    if ( typeof messages === 'string' ) {
      messages = [ messages ];
    }

    if ( !( messages instanceof Array ) ) {
      throw new Error( 
        '`message` must be either a message string or an array of messages' );
    }

    if ( typeof subscriber !== 'function' ) {
      throw new Error( 'Missing or invalid argument: `subscriber`' );
    }

    // Loop through each message and register the sub to the _subscribers object.
    for ( i = 0, len = messages.length; i < len; i++ ) {

      message = messages[i];

      if ( typeof message !== 'string' ) {
        throw new Error( 
          '`message` must be a string' );
      }

      if ( _subscribers[message] ) {
        matchingSubs = _subscribers[ message ].subs;
        cached = _subscribers[message].cached;
      }

      /** If there is a mapping from the message to a matching subscribers 
        * list, add our subscriber if it's not already part of the list.
        * Otherwise, there is no mapping, create a new list.
        */
      if ( matchingSubs ) {
        if ( matchingSubs.indexOf( subscriber ) < 0 ) {
          matchingSubs.push( subscriber );
        }
      }
      else {
        _subscribers[ message ] = {
          subs: [ subscriber ]
        };
      }

      // If there is a cached message, consume it
      if ( cached ) {
        subscriber( cached.message, cached.payload );
      }
    }

    return hub;
  };


  /** Hub#unsub( messages, subscriber )
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
    var matchingPatterns = [];
    var patterns = Object.keys( _subscribers );
    var subs;
    var pattern;
    var message;
    var i;
    var len;

    if ( typeof subscriber !== 'function' ) {
      throw new Error( 'Missing or invalid argument: `subscriber`' );
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
      message = messages[i];

      if ( typeof message !== 'string' ) {
        throw new Error( 'Each message must be a string' );
      }

      // Replace all wildcards with a `[\w*]*` regex.
      pattern = globToRegex( message );

      matchingPatterns = matchingPatterns.concat( 
        patterns.filter( function( key ) {
          return pattern.test( key );
        }) 
      );
    }

    // Filter out duplicate keys
    matchingPatterns = unique( matchingPatterns );

    // Iterate through each matching key and remove the sub if it exists
    for ( i = 0, len = matchingPatterns.length; i < len; i++ ) {
      subs = _subscribers[ matchingPatterns[i] ].subs;

      if ( subs && subs.indexOf( subscriber ) > -1 ) {
        subs.splice( subs.indexOf( subscriber ), 1 );
      }

      // If no more subscribers are registered under the key, delete it
      if ( subs.length === 0 ) {
        delete _subscribers[ matchingPatterns[i] ];
      }
    }

    return hub;
  };

  return hub;

};