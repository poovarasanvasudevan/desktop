var semver = require('semver');
var manifest = require('./package.json');

var req = new XMLHttpRequest();
req.onload = function() {
  if (req.status < 200 || req.status > 299) {
    return callback(new Error(req.status));
  }

  try {
    var data = JSON.parse(req.responseText);
    checkNewVersion(null, semver.gt(data.version, manifest.version), data);
  } catch(error) {
    callback(error);
  }
};
req.open('get', manifest.manifestUrl, true);
req.send();

function checkNewVersion(error, newVersionExists, newManifest) {
  if (error) {
    return alert('Error while trying to update: ' + error);
  }

  if (newVersionExists) {
    var updateMessage = 'There\'s a new version available (' + newManifest.version + ').'
                        + ' Would you like to download the update now?';

    if (confirm(updateMessage)) {
      gui.Shell.openExternal(newManifest.packages[platform]);
      gui.App.quit();
    }
  }
}
