"use strict"
const EventEmitter = require('events');
const util = require('util');
const http = require('http');
const https = require('https');
const request = require('request');
const progress = require('request-progress');
const url = require('url');
const R = require('ramda');
const fs = require('fs');
const path = require('path');


/*
 * defaultoption ={
 *  resume: true,  // last interrupt download will resume
 *  output:{
 *    path: '/tmp',
 *    filename: $urlfilename,
 *  },
 *  headers:{}
 * }
  * */

function download(downloadurl, option) {
  let link = url.parse(downloadurl);

  //merge default option
  option = R.merge({
    url: downloadurl,
    resume: true,
    method: 'GET',
    headers: {},
    output: {
      path: '/tmp',
      filename: link.pathname.split('/').pop()
    }
  },option);

  const outputfilename = path.resolve(R.path(['output','path'],option),R.path(['output','filename'],option));

  const supportRanges = new Promise(function(resolve,reject){
    const request = R.cond([
      [R.equals('http:'),R.always(http.request)],
      [R.equals('https:'),R.always(https.request)]])(link.protocol);

    request({
      method: 'HEAD',
      host: link.hostname,
      port: link.port,
      path: link.path,
    },function(req){
        resolve({
          resume:'accept-ranges' in req.headers,
          contentLength: req.headers['content-length'],
        });
    }).on('checkExpectation',reject)
      .on('error',reject)
      .end();
  });

  const blockSize = new Promise(function(resolve,reject){
    fs.exists(outputfilename, function(exists) {
      if (exists) {
        fs.stat(outputfilename,function(err,stat){
          resolve(stat.size);
        });
      } else
        resolve(0);
    });
  });

  return Promise.all([supportRanges,blockSize])
    .then(function(answer) {
      const resume = answer[0].resume;
      const contentLength = answer[0].contentLength;
      const bytes = answer[1] ;

      if(contentLength <= bytes) throw new Error('file is done');

      option.resume = option.resume&&resume;

      //resume download
      if(option.resume){
        option.headers['Range'] = `bytes=${bytes}-${contentLength}`;
      }
      return option;
    }).then(function(option){
      return {
        request: progress(request.get(option)),
        stream: fs.createWriteStream(outputfilename, { flags: option.resume ?'a':'w',autoClose : true})
      }
    })
}

module.exports = download;
