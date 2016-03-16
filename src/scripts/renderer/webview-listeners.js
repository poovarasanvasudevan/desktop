import {ipcRenderer as ipcr} from 'electron';
import webView from './webview';
import remote from 'remote';

const prefs = remote.require('../browser/utils/prefs').default;

// Log console messages
webView.addEventListener('console-message', function(event) {
  const msg = event.message.replace(/%c/g, '');
  const fwNormal = 'font-weight: normal;';
  const fwBold = 'font-weight: bold;';
  console.log('%cWV:%c ' + msg, fwBold, fwNormal);
});

// Listen for title changes to update the window title
webView.addEventListener('page-title-updated', function() {
  const title = webView.getTitle();
  log('sending page title', title);
  ipcr.send('page-title', title);
});

// Handle url clicks
webView.addEventListener('new-window', function(event) {
  log('sending open-url', event.url);
  ipcr.send('open-url', event.url, event.options);
});

// Listen for dom-ready
webView.addEventListener('dom-ready', function() {
  log('dom-ready');

  // Hide the loading splash screen
  const loadingSplashDiv = document.querySelector('.loading');
  loadingSplashDiv.style.opacity = 0;
  setTimeout(function() {
    loadingSplashDiv.style.display = 'none';
  }, 250);

  // Open dev tools when debugging
  if (window.localStorage.debugDevTools) {
    webView.openDevTools();
  }

  // Restore the default zoom level
  const zoomLevel = prefs.get('zoom-level');
  if (zoomLevel) {
    log('restoring zoom level', zoomLevel);
    webView.send('zoom-level', zoomLevel);
  }

  // Restore spell checker and auto correct
  const spellCheckerCheck = prefs.get('spell-checker-check');
  if (spellCheckerCheck) {
    const autoCorrect = prefs.get('spell-checker-auto-correct');
    const langCode = prefs.get('spell-checker-language');
    log('restoring spell checker', spellCheckerCheck, 'auto correct', autoCorrect, 'lang code', langCode);
    webView.send('spell-checker', spellCheckerCheck, autoCorrect, langCode);
  }
});

// Animate the splash screen into view
document.addEventListener('DOMContentLoaded', function() {
  const loadingSplashDiv = document.querySelector('.loading');
  loadingSplashDiv.style.opacity = 1;
});

export default webView;
