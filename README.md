# Chatra

## Build

### Pre-requisites

    # install gulp
    npm install -g gulp

    # install dependencies
    npm install

* **wine**: If you're on OSX/Linux and want to build for Windows, you need [Wine](http://winehq.org/) installed. Wine is required in order
to set the correct icon for the exe. If you don't have Wine, you can comment out the `winIco` field in `gulpfile`.
* **makensis**: Required by the `pack:win32` task in `gulpfile` to create the Windows installer.

For OSX:

    brew install wine makensis

### OS X

    gulp pack:osx64

### Windows

    gulp pack:win32

Take a look into `gulpfile.coffee` for additional tasks.