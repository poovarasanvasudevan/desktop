import platform from '../utils/platform';
import prefs from '../utils/prefs';
import keyMirror from 'keymirror';
import dialog from 'dialog';
import shell from 'shell';

import AutoUpdater from '../components/auto-updater';
import EventEmitter from 'events';

const STATES = keyMirror({
  IDLE: null,
  UPDATE_CHECKING: null,
  UPDATE_AVAILABLE: null,
  UPDATE_DOWNLOADED: null
});

class AutoUpdateManager extends EventEmitter {

  constructor(manifest, options, mainWindowManager) {
    super();

    this.manifest = manifest;
    this.options = options;
    this.mainWindowManager = mainWindowManager;

    this.enabled = !process.mas && prefs.get('auto-check-update');
    this.state = STATES.IDLE;
    this.states = STATES;

    this.latestVersion = null;
    this.latestDownloadUrl = null;
  }

  init() {
    log('starting auto updater');
    this.initFeedUrl();
    this.initErrorListener();
    this.initStateListeners();
    this.initVersionListener();
  }

  initFeedUrl() {
    let feedUrl = this.manifest.updater.urls[process.platform]
      .replace(/%CURRENT_VERSION%/g, this.manifest.version);

    if (this.options.portable) {
      feedUrl += '/portable';
    }

    log('updater feed url:', feedUrl);
    AutoUpdater.setFeedURL(feedUrl);
  }

  initErrorListener() {
    AutoUpdater.on('error', (ex) => {
      logError('auto updater error', ex);
    });
  }

  initStateListeners() {
    const eventToStateMap = {
      'error': STATES.IDLE,
      'checking-for-update': STATES.UPDATE_CHECKING,
      'update-available': STATES.UPDATE_AVAILABLE,
      'update-not-available': STATES.IDLE,
      'update-downloaded': STATES.UPDATE_DOWNLOADED
    };

    for (let [eventName, state] of Object.entries(eventToStateMap)) {
      AutoUpdater.on(eventName, () => this.state = state);
    }
  }

  initVersionListener() {
    AutoUpdater.on('update-available', (newVersion, downloadUrl) => {
      this.latestVersion = newVersion;
      this.latestDownloadUrl = downloadUrl;
    });
  }

  handleMenuCheckForUpdate() {
    this.checkForUpdate(false);
  }

  handleMenuUpdateAvailable() {
    this.onCheckUpdateAvailable(this.latestVersion, this.latestDownloadUrl);
  }

  handleMenuUpdateDownloaded() {
    this.quitAndInstall();
  }

  setAutoCheck(check) {
    if (this.enabled === check) {
      log('update checker already', check ? 'enabled' : 'disabled');
      return; // same state
    }

    this.enabled = !process.mas && check;
    if (this.enabled) { // disabled -> enabled
      log('enabling auto update checker');
      this.scheduleUpdateChecks();
    } else if (this.scheduledCheckerId) {  // enabled -> disabled
      log('disabling auto update checker');
      clearInterval(this.scheduledCheckerId);
      this.scheduledCheckerId = null;
    }
  }

  onCheckUpdateAvailable(newVersion, downloadUrl) {
    log('onCheckUpdateAvailable', 'newVersion:', newVersion, 'downloadUrl:', downloadUrl);
    if (platform.isLinux) {
      dialog.showMessageBox({
        type: 'info',
        message: 'A new version is available: ' + newVersion,
        detail: 'Use your package manager to update, or click Download to get the new package.',
        buttons: ['OK', 'Download']
      }, function(response) {
        if (response === 1) {
          log('user clicked Download, opening url', downloadUrl);
          shell.openExternal(downloadUrl);
        }
      });
    } else if (platform.isWin && this.options.portable) {
      dialog.showMessageBox({
        type: 'info',
        message: 'A new version is available: ' + newVersion,
        detail: 'Click Download to get a portable zip with the new version.',
        buttons: ['OK', 'Download']
      }, function(response) {
        if (response === 1) {
          log('user clicked Download, opening url', downloadUrl);
          shell.openExternal(downloadUrl);
        }
      });
    } else {
      dialog.showMessageBox({
        type: 'info',
        message: 'A new version is available.',
        detail: 'It will start downloading in the background.',
        buttons: ['OK']
      }, function() {});
    }
  }

  onCheckUpdateNotAvailable() {
    log('onCheckUpdateNotAvailable');
    dialog.showMessageBox({
      type: 'info',
      message: 'No update available.',
      detail: 'You are using the latest version: ' + this.manifest.version,
      buttons: ['OK']
    }, function() {});
  }

  onCheckError(err) {
    log('onCheckError:', err);
    dialog.showMessageBox({
      type: 'error',
      message: 'Error while checking for update.',
      detail: err.message,
      buttons: ['OK']
    }, function() {});
  }

  scheduleUpdateChecks() {
    const checkInterval = 1000 * 60 * 60 * 4; // 4 hours
    log('scheduling update checks every', checkInterval, 'ms');
    this.scheduledCheckerId = setInterval(::this.checkForUpdate, checkInterval);
    this.checkForUpdate();
  }

  checkForUpdate(silent = true) {
    log('checking for update...');
    AutoUpdater.checkForUpdates();
    if (!silent) {
      const onCheck = {};

      const removeListeners = () => {
        AutoUpdater.removeListener('update-available', onCheck.updateAvailable);
        AutoUpdater.removeListener('update-not-available', onCheck.updateNotAvailable);
        AutoUpdater.removeListener('error', onCheck.error);
      };

      onCheck.updateAvailable = () => {
        this.onCheckUpdateAvailable.apply(this, arguments);
        removeListeners();
      };

      onCheck.updateNotAvailable = () => {
        this.onCheckUpdateNotAvailable.apply(this, arguments);
        removeListeners();
      };

      onCheck.error = () => {
        this.onCheckError.apply(this, arguments);
        removeListeners();
      };

      AutoUpdater.once('update-available', onCheck.updateAvailable);
      AutoUpdater.once('update-not-available', onCheck.updateNotAvailable);
      AutoUpdater.once('error', onCheck.error);
    }
  }

  quitAndInstall() {
    if (this.mainWindowManager) {
      this.mainWindowManager.updateInProgress = true;
      AutoUpdater.quitAndInstall();
    } else {
      logError(new Error('cannot quit to install update'));
    }
  }

}

export default AutoUpdateManager;
