"use strict"
const R = require('ramda');
const path = require('path');
const fs = require('fs');

/**
* Load a file
* @param {} filename: string
* @returns {}
*/
function LoadJsonFile(filename){
  return fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename)) : {};
}

/**
* recursion find dependencies path
* @param {} pkgPath
* @param {} thinCache
* @return Promise.resolve([paths])
*/
function Deps(pkgPath,thinCache){
  thinCache = thinCache|| [] ;
  let deps = R.keys(R.pathOr({},['dependencies'])(LoadJsonFile(path.resolve(pkgPath,"package.json"))));
  const deep = R.length(R.split('/', pkgPath));
  deps = R.filter(R.identity, deps);
  return Promise.all(R.map(function(dep){
    return new Promise(function(resolve,reject){
      let done = false;
      let p = null;
      for(let i of R.range(0,deep)){
        p = path.resolve(pkgPath+'/../'.repeat(i),'node_modules',dep);
        if(fs.existsSync(p)){
          if(R.contains(p,thinCache)){
            resolve([]);
            return;
          }else{
            thinCache = R.concat([p],thinCache);
            Deps(p, thinCache).then(function(ary) {
              resolve(R.concat([p],ary));
            });
            done = true;
          }
          break;
        }
      }
      done ? null : reject('can\'t find pkg:'+dep+' for '+pkgPath);
    });
  }, deps)).then(function(argv){
    return Promise.resolve(R.compose(R.uniq,R.flatten)(argv));
  },console.error).catch(console.error);
}

module.exports = function(name){
  return new Promise(function(resolve){
    Deps(name || '.').then(function(ary){
      resolve(R.map(v=>v+"/**/*",ary));
    });
  });
}
