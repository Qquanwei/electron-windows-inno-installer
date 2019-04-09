'use strict'
const EventEmitter = require('events').EventEmitter;
const remote = require('electron').remote;
const app = (remote && remote.app) || require('electron').app;
const cproc = require('child_process');
const path = require('path');
const https = require('follow-redirects').https;
const http = require('follow-redirects').http;
const fs = require('fs')
const parseUrl = require('url').parse
const semver = require('semver');
const pkg = require('./package.json');
const downloader = require('js-downloader');

const updater = new EventEmitter();
let feedURL;
let errCancel = new Error("cancel");
let setupPath = null;

function makeRequest(url){
  let p = parseUrl(url)
  let module = (p.protocol === 'https:' ? https : http)

  let req = module.request({
    method: 'GET',
    host: p.hostname,
    port: p.port,
    path: p.path,
    maxRedirect: 3
  })
  return req;
}

/**
 * @param {String} url
 * @return {Promise}
 */
function request(url) {
  return new Promise(function(resolve, reject) {
    let req = makeRequest(url);

    req.on('response', function(res) {
      let chunks = []
      res.on('data', function(chunk) {
        chunks.push(chunk)
      })
      res.on('end', function() {
        resolve({
          statusCode: res.statusCode,
          body: Buffer.concat(chunks).toString('utf-8')
        })
      })
    })
    req.end()
    req.on('error', function(error) {
      reject(error)
    })
  })
}

updater.setFeedURL = function(url){
  feedURL = url;
}

updater.downloadAndInstall = function(releaseJSON){
  const directory = app.getPath('temp');
  const filename = `${releaseJSON.name}-upgrade.exe`;
  setupPath = path.resolve(directory,filename);
  downloader(releaseJSON.updateURL,{
    resume: false,
    output:{
      path:directory,
      filename: filename
    }}).then((req)=>{
      req.request
         .on('progress',(p)=> this.emit('progress',p))
         .on('error',(e)=>{
           this.emit('error',e);
           this.emit('done');
         }).pipe(req.stream).on('finish',()=>{
           this.emit('update-downloaded', releaseJSON,path.resolve(directory,filename));
           this.emit('done');
         });
    }).catch((e)=>{
      if(e.message === 'file is done') {
        this.emit('update-downloaded', releaseJSON,path.resolve(directory,filename));
        this.emit('done');
        return;
      }
      this.emit('error', e)
      this.emit('done');
    });
}

updater.checkForUpdates = function(isForce){
  if (!feedURL) {
    this.emit('error', 'need to call before setFeedURL')
    this.emit('done');
    return;
  }
  this.emit('checking-for-update')

    request(feedURL).then((res) => {
    if (res.statusCode != 200 && res.statusCode != 204){
      throw new Error('invalid status code: ' + res.statusCode)
    }

    const releaseJSON = JSON.parse(res.body);
    if (res.statusCode == 204 || (!isForce &&semver.gte(app.getVersion(),releaseJSON.version))) {
      this.emit('update-not-available')
      return Promise.reject(errCancel)
    }
    this.emit('update-available', releaseJSON, this.downloadAndInstall.bind(this,releaseJSON));
  }).catch(err => {
    if (err === errCancel){
    } else {
      this.emit('error', err);
    }
    this.emit('done');
    });
}

updater.quitAndInstall = function(){
  if(fs.existsSync(setupPath)){
    setTimeout(function(){
      cproc.spawn(setupPath, ['/SILENT'], {
        detached: true,
        stdio: ['ignore', 'ignore', 'ignore']
      }).unref();

      app.quit();
    },1000);
  }
}

module.exports = updater;
