var gui = require('nw.gui');
var win = gui.Window.get();

var manifest = require('./package.json');
var platform = require('./utils/platform');
var updater = require('./utils/updater');
var menus = require('./utils/menus');
var windowBehaviour = require('./utils/window-behaviour');
var notification = require('./utils/notification');
var leash = require('./utils/leash');

// Leash check
leash.check();

// Ensure there's an app shortcut for toast notifications to work on Windows
if (platform.isWindows) {
  gui.App.createShortcut(process.env.APPDATA + "\\Microsoft\\Windows\\Start Menu\\Programs\\Chatra.lnk");
}

// Check for update
//updater.checkAndPrompt(manifest, win);

// Load the app menus
menus.loadMenuBar(win)
menus.loadTrayIcon(win);

// Adjust the default behaviour of the main window
windowBehaviour.set(win);

// Listen for DOM load
window.onload = function() {
  var iframe = document.querySelector('iframe');

  // Inject a callback in the notification API
  notification.injectClickCallback(iframe.contentWindow, win);

  // Add a context menu
  menus.injectContextMenu(win, iframe.contentWindow, iframe.contentDocument);

  // Bind native events to the content window
  windowBehaviour.bindEvents(win, iframe.contentWindow);

  // Watch the iframe periodically to sync the title
  windowBehaviour.syncTitle(document, iframe.contentDocument);

  // Set the badge update listener
  iframe.contentWindow.$window.on('unreadcount', function(event, count) {
    win.setBadgeLabel(count ? count : '');
  });

  // Let the inside app know it's a desktop app
  iframe.contentWindow.isDesktop = true;
};
