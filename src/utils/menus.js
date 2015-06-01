var gui = window.require('nw.gui');
var AutoLaunch = require('auto-launch');
var clipboard = require('copy-paste');
var windowBehaviour = require('./window-behaviour');
var platform = require('./platform');
var settings = require('./settings');
var updater = require('./updater');
var dispatcher = require('./dispatcher');

module.exports = {
  /**
   * The main settings items. Their placement differs for each platform:
   * - on OS X they're in the top menu bar
   * - on Windows they're in the tray icon's menu
   * - on all 3 platform, they're also in the right-click context menu
   */
  settingsItems: function(win, keep) {
    return [{
      type: 'checkbox',
      label: 'Launch on Startup',
      setting: 'launchOnStartup',
      click: function() {
        settings.launchOnStartup = this.checked;

        var launcher = new AutoLaunch({
          name: 'Chatra',
          isHidden: true
        });

        launcher.isEnabled(function(enabled) {
          if (settings.launchOnStartup && !enabled) {
            launcher.enable(function(error) {
              if (error) {
                console.error(error);
              }
            });
          }

          if (!settings.launchOnStartup && enabled) {
            launcher.disable(function(error) {
              if (error) {
                console.error(error);
              }
            });
          }
        });
      }
    }, {
      type: 'checkbox',
      label: 'Open Links in the Browser',
      setting: 'openLinksInBrowser',
      click: function() {
        settings.openLinksInBrowser = this.checked;
        win.removeAllListeners('new-win-policy');
        win.on('new-win-policy', function(frame, url, policy) {
          if (settings.openLinksInBrowser) {
            gui.Shell.openExternal(url);
            policy.ignore();
          } else {
            policy.forceNewWindow();
          }
        });
      }
    }, {
      label: 'Check for Updates',
      click: function() {
        updater.check(gui.App.manifest, function(error, newVersionExists, newManifest) {
          if (error || newVersionExists) {
            updater.prompt(win, false, error, newVersionExists, newManifest);
          } else {
            dispatcher.trigger('win.alert', {
              win: win,
              message: 'You’re using the latest version: ' + gui.App.manifest.version
            });
          }
        });
      }
    }].map(function(item) {
      // If the item has a 'setting' property, use some predefined values
      if (item.setting) {
        if (!item.hasOwnProperty('checked')) {
          item.checked = settings[item.setting];
        }

        if (!item.hasOwnProperty('click')) {
          item.click = function() {
            settings[item.setting] = item.checked;
          };
        }
      }

      return item;
    }).filter(function(item) {
      // Remove the item if the current platform is not supported
      return !Array.isArray(item.platforms) || (item.platforms.indexOf(platform.type) != -1);
    }).map(function(item) {
      var menuItem = new gui.MenuItem(item);
      menuItem.setting = item.setting;
      return menuItem;
    });
  },

  /**
   * Create the menu bar for the given window, only on OS X.
   */
  loadMenuBar: function(win) {
    if (!platform.isOSX) {
      return;
    }

    var menu = new gui.Menu({
      type: 'menubar'
    });

    menu.createMacBuiltin('Chatra');
    var submenu = menu.items[0].submenu;

    submenu.insert(new gui.MenuItem({
      type: 'separator'
    }), 1);

    // Add the main settings
    this.settingsItems(win, true).forEach(function(item, index) {
      submenu.insert(item, index + 2);
    });

    // Watch the items that have a 'setting' property
    submenu.items.forEach(function(item) {
      if (item.setting) {
        settings.watch(item.setting, function(value) {
          item.checked = value;
        });
      }
    });

    win.menu = menu;
  },

  /**
   * Create the menu for the tray icon.
   */
  createTrayMenu: function(win) {
    var menu = new gui.Menu();

    // Add the main settings
    this.settingsItems(win, true).forEach(function(item) {
      menu.append(item);
    });

    menu.append(new gui.MenuItem({
      type: 'separator'
    }));

    menu.append(new gui.MenuItem({
      label: 'Open Chatra',
      click: function() {
        win.show();
        win.focus();
      }
    }));

    menu.append(new gui.MenuItem({
      label: 'Quit Chatra',
      click: function() {
        win.close(true);
      }
    }));

    // Watch the items that have a 'setting' property
    menu.items.forEach(function(item) {
      if (item.setting) {
        settings.watch(item.setting, function(value) {
          item.checked = value;
        });
      }
    });

    return menu;
  },

  /**
   * Create the tray icon for Windows and Linux.
   */
  loadTrayIcon: function(win) {
    if (!platform.isWindows) {
      return;
    }

    var tray = new gui.Tray({
      icon: 'icon.png'
    });

    tray.on('click', function() {
      win.show();
      win.focus();
    });

    tray.tooltip = 'Chatra';
    tray.menu = this.createTrayMenu(win);

    // keep the object in memory
    win.tray = tray;
  },

  /**
   * Create a context menu for the window and document.
   */
  createContextMenu: function(win, window, document, targetElement) {
    var menu = new gui.Menu();

    menu.append(new gui.MenuItem({
      label: 'Reload',
      click: function() {
        windowBehaviour.saveWindowState(win);
        win.reload();
      }
    }));

    menu.append(new gui.MenuItem({
      label: 'Navigate Back',
      click: function() {
        window.history.back();
      }
    }));

    menu.append(new gui.MenuItem({
      label: 'Navigate Forward',
      click: function() {
        window.history.forward();
      }
    }));

    if (targetElement.tagName.toLowerCase() == 'input') {
      menu.append(new gui.MenuItem({
        type: 'separator'
      }));

      menu.append(new gui.MenuItem({
        label: "Cut",
        click: function() {
          clipboard.copy(targetElement.value);
          targetElement.value = '';
        }
      }));

      menu.append(new gui.MenuItem({
        label: "Copy",
        click: function() {
          clipboard.copy(targetElement.value);
        }
      }));

      menu.append(new gui.MenuItem({
        label: "Paste",
        click: function() {
          clipboard.paste(function(value) {
            targetElement.value = value;
          });
        }
      }));
    } else if (targetElement.tagName.toLowerCase() == 'a') {
      menu.append(new gui.MenuItem({
        type: 'separator'
      }));

      menu.append(new gui.MenuItem({
        label: "Copy Link",
        click: function() {
          clipboard.copy(targetElement.href);
        }
      }));
    } else {
      var selection = window.getSelection().toString();
      if (selection.length > 0) {
        menu.append(new gui.MenuItem({
          type: 'separator'
        }));

        menu.append(new gui.MenuItem({
          label: "Copy",
          click: function() {
            clipboard.copy(selection);
          }
        }));
      }
    }

    menu.append(new gui.MenuItem({
      type: 'separator'
    }));

    this.settingsItems(win, false).forEach(function(item) {
      menu.append(item);
    });

    return menu;
  },

  /**
   * Listen for right clicks and show a context menu.
   */
  injectContextMenu: function(win, window, document) {
    if (window.contextMenuListener) {
      document.body.removeEventListener('contextmenu', window.contextMenuListener);
    }

    window.contextMenuListener = function(event) {
      event.preventDefault();
      this.createContextMenu(win, window, document, event.target).popup(event.x, event.y);
      return false;
    }.bind(this);

    document.body.addEventListener('contextmenu', window.contextMenuListener);
  }
};
