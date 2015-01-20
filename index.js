var Hub = require( './src/hub' );

// The one they call 'The Dispatcher' aka 'Dispatch'
module.exports = {
  hub: function() {
    // Drumroll please...
    return Hub();
  }
};