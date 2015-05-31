module.exports = {
  /**
   * Inject a callback in the onclick event.
   */
  injectClickCallback: function(window, win) {
    var NativeNotification = window.Notification;

    // Already injected
    if (NativeNotification.customInjected) {
      return;
    }

    window.Notification = function(title, options) {
      var defaultOnClick = options.onclick;

      delete options.onclick;
      delete options.icon;

      var notif = new NativeNotification(title, options);
      notif.addEventListener('click', function() {
        win.show();
        win.focus();

        if (defaultOnClick) {
          defaultOnClick();
        }
      });

      return notif;
    };

    window.Notification.prototype = NativeNotification.prototype;
    window.Notification.permission = NativeNotification.permission;
    window.Notification.requestPermission = NativeNotification.requestPermission.bind(window.Notification);
    window.Notification.customInjected = true;
  }
};
