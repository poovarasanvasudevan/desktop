# Chatra

> See the CI config files from [Whatsie](https://github.com/Aluxian/Whatsie) to understand how the build->pack->publish process works.

## How to install

### OS X

1. Download [chatra-x.x.x-osx.dmg][LR] or [chatra-x.x.x-osx.zip][LR]
2. Open or unzip the file and drag the app into the `Applications` folder

The app will update automatically.

### Windows

#### Installer

1. Download [chatra-x.x.x-win32-setup.exe][LR]
2. Run the installer, wait until it finishes

The app will update automatically.

#### Portable

1. Download [chatra-x.x.x-win32-portable.zip][LR]
2. Extract the zip and run the app

The app will NOT update automatically, but you can still check for updates.

# For Developers

## Build

### Install dependencies

Global dependencies:

```
npm install -g gulp
```

Local dependencies:

```
npm install
```

The last command should also install the modules for `./src`. If `./src/node_modules/` doesn't exist then:

```
cd ./src
npm install
```

### Native modules

The app uses native modules. Make sure you rebuild the modules before building the app:

```
gulp rebuild:<32|64>
```

### Build and watch

During development you can use the `watch` tasks, which have live reload. As you edit files in `./src`, they will be re-compiled and moved into the `build` folder:

```
gulp watch:<darwin64|win32>
```

If you want to build it just one time, use `build`:

```
gulp build:<darwin64|win32>
```

For production builds, set `NODE_ENV=production` or use the `--prod` flag. Production builds don't include javascript sourcemaps or dev modules.

```
gulp build:<darwin64|win32> --prod
NODE_ENV=production gulp build:<darwin64|win32>
```

To see detailed logs, run every gulp task with the `--verbose` flag.

If you don't specify a platform when running a task, the task will run for the current platform.

### App debug logs

To see debug messages while running the app, set the `DEBUG` env var. This will print logs from the main process.

```
export DEBUG=chatra:*
```

To enable the renderer logs launch the app, open the dev tools then type in the console:

```
localStorage.debug = 'chatra:*';
```

If you want to automatically open the webview dev tools, type this in the main dev tools console:

```
localStorage.debugDevTools = true;
```

### Pack

#### OS X

You'll need to set these env vars:

```
SIGN_DARWIN_IDENTITY
SIGN_DARWIN_KEYCHAIN_NAME
SIGN_DARWIN_KEYCHAIN_PASSWORD
```

Pack the app in a neat .dmg:

```
gulp pack:darwin64:<dmg:zip> [--prod]
```

This uses [node-appdmg](https://www.npmjs.com/package/appdmg) which works only on OS X machines.

#### Windows

You'll need to set these env vars:

```
SIGNTOOL_PATH=
SIGN_WIN_CERTIFICATE_FILE=
SIGN_WIN_CERTIFICATE_PASSWORD=
GITHUB_TOKEN (optional, in case you get errors from GitHub)
```

Create an installer. This will also sign every executable inside the app, and the setup exe itself:

```
gulp pack:win32:installer [--prod]
```

Or, if you prefer, create a portable zip. This will also sign the executable:

```
gulp pack:win32:portable [--prod]
```

These tasks only work on Windows machines due to their dependencies: [Squirrel.Windows](https://github.com/Squirrel/Squirrel.Windows) and Microsoft's SignTool.

## Publish

### GitHub

Upload all the files from `./dist` to GitHub.

```
gulp publish:github
```

[LR]: https://github.com/chatr/desktop/releases/latest
