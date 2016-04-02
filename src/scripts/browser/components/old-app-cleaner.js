import async from 'async';
import path from 'path';
import del from 'del';
import app from 'app';
import fs from 'fs';

const paths = [
  path.join(app.getPath('desktop'), 'Chatra.lnk'),
  path.join(app.getPath('desktop'), 'Unofficial Chatra.lnk'),
  path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Chatra'),
  path.join(app.getPath('appData'), '..', 'Local', 'Chatra'),
  'C:', 'ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Chatra.lnk',
  'C:', 'Program Files', 'Chatra',
  'C:', 'Program Files (x86)', 'Chatra'
];

function check(callback) {
  async.series(paths.map(p => function(cb) {
    fs.access(p, fs.R_OK | fs.W_OK, (err) => {
      cb(err ? null : new Error('FOUND'));
    });
  }), function(err) {
    callback(!!(err && err.message === 'FOUND'));
  });
}

function clean(callback) {
  async.parallel(paths.map(p => function(cb) {
    del(p, { force: true })
      .catch(err => {
        logError(err);
        cb();
      })
      .then(paths => {
        log('deleted', paths);
        cb();
      });
  }), callback);
}

export default {
  check,
  clean
};
