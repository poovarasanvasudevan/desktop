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
    gulp.src './src/**'
      .pipe $.nodeWebkitBuilder
        platforms: [platform]
        #winIco: './assets/icon.ico'
        macIcns: './assets/icon.icns'
        macZip: true
        macPlist:
          NSHumanReadableCopyright: 'Copyright © 2015 chatra.io'
          CFBundleIdentifier: 'io.chatra.desktop'

# Create a DMG for osx64; only works on OS X because of appdmg
gulp.task 'pack:osx64', ['build:osx64'], ->
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

# Make packages for all platforms by default
gulp.task 'default', ['pack:all']
