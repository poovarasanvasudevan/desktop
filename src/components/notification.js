var notifier = require('node-notifier');
var platform = require('./platform');

module.exports = function(NativeNotification, onClick) {
  notifier.on('click', function(notifierObject, options) {
    [onClick, options.events.onclick].forEach(function(cb) {
      if (typeof(cb) === 'function') {
        cb();
      }
    });
  });

  function Notification(title, options) {
    switch (platform.name) {
      case 'osx':
        var onclick = options.onclick;
        var onclose = options.onclose;
        var onerror = options.onerror;
        var onshow = options.onshow;

        delete options.icon;
        delete options.onclick;
        delete options.onclose;
        delete options.onerror;
        delete options.onshow;

        var notification = new NativeNotification(title, options);

        notification.addEventListener('click', function(e) {
          [onclick, onClick].forEach(function(cb) {
            if (typeof(cb) === 'function') {
              cb();
            }
          });
        });

        break;

      case 'win':
        notifier.notify({
          title: title,
          message: options.body,
          time: 3000,
          wait: true,
          events: {
            onclick: options.onclick,
            onclose: options.onclose,
            onerror: options.onerror,
            onshow: options.onshow
          }
        });

        break;
    }
  }

  Notification.permission = 'granted';
  Notification.requestPermission = function(callback) {
    if (callback) {
      callback('granted');
    }
  };

  return Notification;
};
