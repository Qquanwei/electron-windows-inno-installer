# Build Your Installer Easy to RELEASE & UPDATE

## Installation

* `npm install electron-windows-inno-installer -g`


## Required

* wine `brew install wine --devel`

## Build Your Project

need your `*.iss` file in your work directory

you can using `electron-windows-inno-installer --make-iss` and then `vim example.iss` to make your setup.iss file

```
rm -rf release/
electron-windows-inno-installer ./setup.iss --platform win32-x64 --icon ./favicon.ico
```


## AutoUpdater


* npm install electron-windows-inno-installer --save

the api same as 'https://github.com/electron/electron/blob/master/docs/api/auto-updater.md'

```javascript
(electron app.js)

const autoupdater = require('electron-windows-inno-installer');

//support http/https 
autoupdater.setFeedURL('https://raw.githubusercontent.com/codeskyblue/electron-quick-start/master/example-feed.json'); 

autoupdater.on('update-downloaded',function(data){
  console.log('release notes: ',data.releaseNotes);
  autoupdater.quitAndInstall(); // Upgrade
});

autoupdater.on('update-not-available',function(){
  console.log('INFO: Update not available');
});

autoupdater.on('update-available',function(next,releasefile){
  console.log('INFO: Update available',releasefile);
  next(); //will be download
});

autoupdater.on('progress',function(progress){
  console.log(progress);  // download progress
});


```


## workflow:

`(some html/js/css)` -> `electron-prebuild`  -> `gulp-inno` -> `installer.exe`


## FAQ

  There are some case in your building.

* Download electron-v{version}-win32-x64.zip is slowly or failure

download the file from `https://github.com/electron/electron/releases` or `https://npm.taobao.org/mirrors/electron/` to directory `.cache/{version}/{platform}`.

example `wget https://npm.taobao.org/mirrors/electron/1.3.1/electron-v1.3.1-win32-ia32.zip -P /you/project/.cache/v1.3.1/`

## Contribution

I pleases to anyone contribute code, if you want to change `cli program` please fork the project . if you want to modify `module` you can fork `https://github.com/Qquanwei/electron-inno-auto-update/` this project and modify on `develop branch`.
