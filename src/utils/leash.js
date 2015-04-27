var request = require('request');

module.exports = {
  /**
   * Call home to check if the app is still active.
   */
  check: function() {
    request.head('http://app-leash.aluxian.com/chatra', function(error, response, body) {
      if (!error && response.statusCode == 205) {
        gui.App.quit();
      }
    });
  }
};
