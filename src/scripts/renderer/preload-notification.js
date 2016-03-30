import EventEmitter from 'events';
import remote from 'remote';

const nativeNotifier = remote.require('../browser/bridges/native-notifier').default;
const mainWindowManager = remote.getGlobal('application').mainWindowManager;

// Extend the default notification API
window.Notification = (function(Html5Notification) {
  log('extending HTML5 Notification');

  const Notification = function(title, options) {
    if (!nativeNotifier.isImplemented) {
      log('showing html5 notification', title, options);
      const notification = new Html5Notification(title, options);

      // Add click listener to focus the app
      notification.addEventListener('click', function() {
        mainWindowManager.showOrCreate();
      });

      return notification;
    }

    log('showing native notification');
    const canReply = typeof options.replyCallback === 'function';
    const nativeOptions = Object.assign({}, options, {
      canReply: canReply,
      title: title
    });

    // HTML5-like event emitter to be returned
    const result = Object.assign(new EventEmitter(), nativeOptions);

    // Add a dummy close callback
    result.close = function() {
      log('notification.close() not implemented');
    };

    // Set the click handler
    nativeOptions.onClick = function(payload) {
      log('notification clicked', payload);
      result.emit('click');

      // Call additional handlers
      if (result.onclick) {
        result.onclick();
      }

      // Send the reply
      if (canReply && payload.response) {
        log('sending reply', payload.response);
        options.replyCallback(payload.response);
      }
    };

    // Fire the notification
    nativeNotifier.fireNotification(nativeOptions);
    return result;
  };

  return Object.assign(Notification, Html5Notification);
})(window.Notification);
