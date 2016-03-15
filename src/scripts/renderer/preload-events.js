import {webFrame, ipcRenderer as ipcr} from 'electron';
import SpellChecker from 'spellchecker';
import path from 'path';

// Set zoom level
ipcr.on('zoom-level', function(event, zoomLevel) {
  log('zoom level', zoomLevel);
  webFrame.setZoomLevel(zoomLevel);
});

// Set spell checker
ipcr.on('spell-checker', function(event, enabled, autoCorrect, langCode) {
  // Taken from https://github.com/atom/node-spellchecker/blob/master/lib/spellchecker.js
  function getDictionaryPath() {
    let dict = path.join(__dirname, '..', 'node_modules', 'spellchecker', 'vendor', 'hunspell_dictionaries');
    try {
      // HACK: Special case being in an asar archive
      const unpacked = dict.replace('.asar' + path.sep, '.asar.unpacked' + path.sep);
      if (require('fs').statSyncNoException(unpacked)) {
        dict = unpacked;
      }
    } catch (ex) {
      // ignore
    }
    return dict;
  }

  const chromiumLangCode = langCode.replace('_', '-');
  autoCorrect = !!autoCorrect;
  log('spell checker enabled:', enabled, 'auto correct:', autoCorrect, 'lang code:', langCode);

  if (enabled) {
    SpellChecker.setDictionary(langCode, getDictionaryPath());
    webFrame.setSpellCheckProvider(chromiumLangCode, autoCorrect, {
      spellCheck: function(text) {
        return !SpellChecker.isMisspelled(text);
      }
    });
  } else {
    webFrame.setSpellCheckProvider(chromiumLangCode, autoCorrect, {
      spellCheck: function() {
        return true;
      }
    });
  }
});

// Add the selected misspelling to the dictionary
ipcr.on('add-selection-to-dictionary', function() {
  SpellChecker.add(document.getSelection().toString());
});
