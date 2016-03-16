import {ipcRenderer as ipcr} from 'electron';
import spellChecker from 'spellchecker';

// Forward context menu opens
document.addEventListener('contextmenu', function(event) {
  event.preventDefault();

  const selection = document.getSelection().toString();
  const trimmedText = selection.trim();
  const isMisspelling = !trimmedText.includes(' ') && spellChecker.isMisspelled(trimmedText);
  const corrections = isMisspelling ? spellChecker.getCorrectionsForMisspelling(trimmedText) : [];

  const payload = {
    selection: selection,
    hasSelection: !!selection,
    targetIsEditable: event.target.isContentEditable || event.target.tagName == 'TEXTAREA',
    targetIsLink: event.target.tagName == 'A',
    isMisspelling: isMisspelling,
    corrections: corrections,
    href: event.target.href
  };

  log('sending context menu', payload);
  ipcr.send('context-menu', payload);
}, false);

// Set the notif count listener
window.addEventListener('load', function() {
  log('document loaded');
  window.$window.on('unreadcount', function(event, rawCount) {
    const parsed = parseInt(rawCount, 10);
    const count = isNaN(parsed) || !parsed ? '' : '' + parsed;
    log('sending notif-count', count);
    ipcr.send('notif-count', count);
  });
});
