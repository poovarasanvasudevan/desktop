import EventEmitter from 'events';
import remote from 'remote';

const nativeNotifier = remote.require('../browser/bridges/native-notifier').default;

// Extend the default notification API
window.Notification = (function(Html5Notification) {
  log('extending HTML5 Notification');

  const Notification = function(title, options) {
    if (!nativeNotifier.isImplemented) {
      log('showing html5 notification', title, options);
      return new Html5Notification(title, options);
    }

    log('showing native notification');
    const nativeOptions = Object.assign({}, options, {
      canReply: true,
      title: title
    });

    // HTML5-like event emitter to be returned
    const result = Object.assign(new EventEmitter(), nativeOptions);

    // Set the click handler
    nativeOptions.onClick = function(payload) {
      log('notification clicked', payload);
      result.emit('click');

      // Call additional handlers
      if (result.onclick) {
        result.onclick();
      }

      // Send the reply
      if (payload.response) {
        log('sending reply', payload.response);
        setTimeout(function() {
          if (typeReply(payload.response)) {
            sendReply();
          }
        }, 50);
      }
    };

    // Fire the notification
    nativeNotifier.fireNotification(nativeOptions);
    return result;
  };

  return Object.assign(Notification, Html5Notification);
})(window.Notification);

function typeReply(replyText) {
  const event = document.createEvent('TextEvent');
  event.initTextEvent('textInput', true, true, window, replyText, 0, 'en-US');
  const inputField = document.querySelector('div.input');
  if (inputField) {
    inputField.focus();
    return inputField.dispatchEvent(event);
  }
  return false;
}

function sendReply() {
  const event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  const sendButton = document.querySelector('.icon.btn-icon.icon-send');
  if (sendButton) {
    sendButton.dispatchEvent(event);
  }
}
