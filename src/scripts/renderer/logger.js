import manifest from '../../package.json';
import debug from 'debug/browser';
import path from 'path';
import {app} from 'remote';

function namespaceOf(filename) {
  const name = path.basename(filename, '.js');
  return manifest.name + ':' + name;
}

export function debugLogger(filename) {
  const log = debug(namespaceOf(filename));
  log.log = console.info.bind(console);
  return log;
}

export function errorLogger(filename, fatal) {
  const fakePagePath = filename.replace(app.getAppPath(), '');
  return function(...args) {
    if (fatal) {
      console.error(`FATAL [${fakePagePath}]`, ...args);
    } else {
      console.error(`ERROR [${fakePagePath}]`, ...args);
    }
  };
}
