gulp = require 'gulp'
shelljs = require 'shelljs'
runSequence = require 'run-sequence'
$ = require('gulp-load-plugins')()

# Remove directories used by the tasks
gulp.task 'clean', ->
  shelljs.rm '-rf', './build'
  shelljs.rm '-rf', './dist'

# Build for each platform; on OSX/Linux, you need Wine installed to build win32 (or remove winIco below)
['win32', 'osx64'].forEach (platform) ->
  gulp.task 'build:' + platform, ->
    if process.argv.indexOf('--toolbar') > 0
      shelljs.sed '-i', '"toolbar": false', '"toolbar": true', './src/package.json'

    gulp.src './src/**'
      .pipe $.nodeWebkitBuilder
        platforms: [platform]
        version: '0.12.2'
        winIco: './assets-windows/icon.ico'
        macIcns: './assets-osx/icon.icns'
        macZip: true
        macPlist:
          NSHumanReadableCopyright: 'Copyright © 2015 Chatra.io'
          CFBundleIdentifier: 'io.chatra.desktop'
      .on 'end', ->
        if process.argv.indexOf('--toolbar') > 0
          shelljs.sed '-i', '"toolbar": true', '"toolbar": false', './src/package.json'

# Only runs on OSX (requires XCode properly configured)
gulp.task 'sign:osx64', ['build:osx64'], ->
  shelljs.exec 'codesign -v -f -s "my signing identity" ./build/Messenger/osx64/Messenger.app/Contents/Frameworks/*'
  shelljs.exec 'codesign -v -f -s "my signing identity" ./build/Messenger/osx64/Messenger.app'
  shelljs.exec 'codesign -v --display ./build/Messenger/osx64/Messenger.app'
  shelljs.exec 'codesign -v --verify ./build/Messenger/osx64/Messenger.app'

# Create a DMG for osx64; only works on OS X because of appdmg
gulp.task 'pack:osx64', ['sign:osx64'], ->
  shelljs.mkdir '-p', './dist'         # appdmg fails if ./dist doesn't exist
  shelljs.rm '-f', './dist/Chatra.dmg' # appdmg fails if the dmg already exists

  gulp.src []
    .pipe require('gulp-appdmg')
      source: './assets-osx/dmg.json'
      target: './dist/Chatra.dmg'

# Create a nsis installer for win32; must have `makensis` installed
gulp.task 'pack:win32', ['build:win32'], ->
   shelljs.exec 'makensis ./assets-windows/installer.nsi'

# Make packages for all platforms
gulp.task 'pack:all', (callback) ->
  runSequence 'pack:osx64', 'pack:win32', callback

# Build osx64 and run it
gulp.task 'run:osx64', ['build:osx64'], ->
  shelljs.exec 'open ./build/Chatra/osx64/Chatra.app'

# Open the osx64 app
gulp.task 'open:osx64', ->
  shelljs.exec 'open ./build/Chatra/osx64/Chatra.app'

# Change the version of the manifest files
# Use like this: gulp version --1.2.0
gulp.task 'version', ->
  version = process.argv[3].substring(2)
  shelljs.sed '-i', /"version": ".*",/, '"version": "' + version + '",', './package.json'
  shelljs.sed '-i', /"version": ".*",/, '"version": "' + version + '",', './src/package.json'
  shelljs.sed '-i', /download\/v.*\/Chatra/g, 'download/v' + version + '/Chatra', './src/package.json'

# Make packages for all platforms by default
gulp.task 'default', ['pack:all']
