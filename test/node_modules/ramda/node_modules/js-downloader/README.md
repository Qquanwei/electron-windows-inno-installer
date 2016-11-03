#JS-DOWNLOADER

Features:
* download
* pause
* resume
* progress

## Install

* npm install js-downloader --save


## Usage

```
"use strict"
let fs = require('fs');
let download = require('js-downloader');

/*
 * defaultoption ={
 *  resume: true,  // resume switch
 *  output:{
 *    path: '/tmp',
 *    filename: $urlfilename,
 *  },
 *  headers:{}
 * }
  * */

download('http://localhost:8000/setup.exe',{}).then(function(req){
  /*
   * req = {
   *   request,
   *   stream,   //download fullpath,will be write'
   * }
    * */

  let stream = req.stream;

  req.request
    .on('end',()=>console.log('done'))
    .on('error',console.log)
    .on('progress',console.log)
    .on('abort',()=>console.log('abort'))
    .pipe(stream);

  setTimeout(function(){
    req.request.abort(); // will be abort
  },10000);

}).catch(function(e){
  if(e.message === 'file is done'){
    //ignore , local file is already download
  }else
    console.log(e);
});
```
