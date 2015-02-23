var assert = require( 'assert' );
var sinon  = require( 'sinon' );
var Hub    = require( '../src/hub' );

describe( 'Hub#sub( message, subscriber )', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  });

  describe( 'when `message` is not a string or an array of strings', function() {

    it( 'throws an error', function() {
      var subscriber = sinon.stub();

      assert.throws( function() {
        hub.sub( undefined, subscriber );
      });

      assert.throws( function() {
        hub.sub( {}, subscriber );
      });

      assert.throws( function() {
        hub.sub( [undefined, {}], subscriber );
      });
    });
  });

  describe( 'when `subscriber` is not a function', function() {

    it( 'throws an error', function() {
      var message = 'menu:click';

      assert.throws( function() {
        hub.sub( message, undefined );
      });

      assert.throws( function() {
        hub.sub( message, 'string' );
      });

      assert.throws( function() {
        hub.sub( message, {} );
      });
    });
  });

  describe( 'when more than one wildcard is given', function() {

    it( 'does not throw an error', function() {
      var subscriber = sinon.spy();

      assert.doesNotThrow( function() {
        hub.sub( 'mod**:signal', subscriber );
      });

      assert.doesNotThrow( function() {
        hub.sub( 's***', subscriber );
      });
    });
  });

  describe( 'when just a wildcard is given', function() {

    it( 'subscribes to all messages', function() {
      var subscriber = function() {};
      var spy = sinon.spy( subscriber );

      hub.sub( '*', spy );

      hub.dispatch( 'home-nav-link:click' );
      hub.dispatch( 'menu:open' );
      hub.dispatch( 'connect' );

      assert( spy.calledThrice );
    });
  });

  describe( 'when array is given as the `message` argument', function() {

    it( 'subscribes to multiple messages ', function() {
      var subscriber = function() {};
      var spy = sinon.spy( subscriber );

      hub.sub(['menu:open', 'menu:close'], spy );

      hub.dispatch( 'menu:toggle' );
      hub.dispatch( 'menu:open' );
      hub.dispatch( 'menu:close' );

      assert( spy.calledTwice );
    });
  });

});

describe( 'Hub#dispatch( message, payload )', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  });

  it( 'sends the `message` and `payload` to each subscribed module', function() {
    var sub1 = function() {};
    var sub2 = function() {};
    var spy1 = sinon.spy( sub1 );
    var spy2 = sinon.spy( sub2 );
    
    hub.sub( 'menu:open', spy1 );
    hub.sub( 'menu:open', spy2 );

    hub.dispatch( 'menu:open', { foo: 'bar' } );

    assert( spy1.calledWith( 'menu:open', { foo: 'bar' }));
    assert( spy2.calledWith( 'menu:open', { foo: 'bar' }));
  });

  it( 'sends the `message` and `payload` to subcribers of wildcards', function() {
    var subscriber = function() {};
    var spy = sinon.spy( subscriber );
    
    hub.sub( 'menu:*', spy );

    hub.dispatch( 'menu:open', { foo: 'bar' } );

    assert( spy.calledWith( 'menu:open', { foo: 'bar' }) );
  });

  describe( 'when a subscriber subscribes to overlapping patterns', function() {

    it( 'only sends a message to a sub once per emission', function() {
      var subscriber = function() {};
      var spy = sinon.spy( subscriber );
      
      hub.sub( 'menu:*', spy );
      hub.sub( 'menu:open', spy );

      // open matches twice but should generate just one emission
      hub.dispatch( 'menu:open', { foo: 'bar' } );
      hub.dispatch( 'menu:close', { foo: 'baz' } );

      assert( spy.calledTwice );
    });
  });

  it( "doesn't send messages to subscribers that aren't subscribed", function() {
    var sub1 = function() {};
    var sub2 = function() {};
    var spy1 = sinon.spy( sub1 );
    var spy2 = sinon.spy( sub2 );

    hub.sub( 'menu:cl', spy1 );
    hub.sub( 'menu:close', spy2 );

    hub.dispatch( 'menu:click', { cash: 'money' } );

    assert( !spy1.called );
    assert( !spy2.called );
  });

  describe( 'when a subscriber unsubscribes', function() {

    it( "stops sending messages to that subscriber", function() {
      var subscriber = function() {};
      var spy = sinon.spy( subscriber );

      hub.sub( 'menu:open', spy );

      hub.dispatch( 'menu:open' );
      hub.unsub( 'menu:open', spy );
      hub.dispatch( 'menu:open' );

      assert( spy.calledOnce );
    });
  });

  describe( 'when given a "*" pattern as a message', function() {
  
    it( 'throws an error', function() {

      assert.throws( function() {
        hub.dispatch( '*', 'payload' );
      });

      assert.throws( function() {
        hub.dispatch( '*:signal', 'payload' );
      });

      assert.throws( function() {
        hub.dispatch( 'module:*', 'payload' );
      });

      assert.throws( function() {
        hub.dispatch( '*:*', 'payload' );
      });
    });
  });
});


describe( 'Hub#unsub( messages, sub )', function() {
  var hub;

  beforeEach( function() {
    hub = Hub();
  });

  it( 'stops sending `sub` `messages` of the given type', function() {
    var subscriber = function() {};
    var spy = sinon.spy( subscriber );

    hub.sub( ['menu:open', 'menu:close', 'modal:open'], spy );
  
    hub.unsub( 'menu:open', spy );

    hub.dispatch( 'menu:open' );
    hub.dispatch( 'modal:open' );
    hub.dispatch( 'menu:close' );

    assert.equal( spy.callCount, 2 );
  });

  describe( 'when `subscriber` argument is not passed in', function() {

    it( 'throws an error', function() {

      assert.throws( function() {
        hub.unsub( 'module:signal' );
      });
    });
  });

  describe( 'when one subscriber unsubs from a message', function() {
    
    it( 'should not unsub any other subscribers', function() {
      var sub1 = function() {};
      var sub2 = function() {};
      var spy1 = sinon.spy( sub1 );
      var spy2 = sinon.spy( sub2 );

      hub.sub( 'menu:open', spy1 );
      hub.sub( 'menu:open', spy2 );

      hub.unsub( 'menu:open', spy1 );
      hub.dispatch( 'menu:open' );

      assert.equal( spy1.callCount, 0 );
      assert.equal( spy2.callCount, 1 );
    });
  });

  describe( 'when `message` is not a string or an array of messages', function() {

    it( 'throws an error', function() {
      var subscriber = function() {};

      assert.throws( function() {
        hub.unsub( undefined, subscriber );
      });

      assert.throws( function() {
        hub.unsub( {}, subscriber );
      });
    });
  });

  describe( 'when given a message value of `*`', function() {

    it( 'unsubscribes from all messages', function() {
      var subscriber = function() {};
      var spy = sinon.spy( subscriber );

      hub.sub( ['menu:open', 'modal:open', 'button:click'], spy );


      hub.dispatch( 'menu:open' );

      assert.equal( spy.callCount, 1 );
      
      hub.unsub( '*', spy );

      hub.dispatch( 'menu:open' );
      hub.dispatch( 'modal:open', { type: 'mastery-trees' } );
      hub.dispatch( 'button:click' );

      assert.equal( spy.callCount, 1 );
    });
  });
});