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
* @param {} pkgPath: string
* @returns {} 
*/
function Deps(pkgPath){
  const deps = R.keys(R.pathOr({},['dependencies'])(LoadJsonFile(path.resolve(pkgPath,"package.json"))));
  const deep = R.length(R.split('/',pkgPath));
  const findPackage = (baseDir,pkgName) => fs.existsSync(path.resolve(baseDir,"node_modules",pkgName));

  return Promise.all(R.map(function(dep){
    return new Promise(function(resolve,reject){
      let done = false;
      let p = null;
      for(let i of R.range(0,deep)){
        p = path.resolve(pkgPath+'/../'.repeat(i),'node_modules',dep);
        if(fs.existsSync(p)){
          Deps(path.resolve(p)).then(function(ary){
            resolve(R.concat([p],ary));
          });
          done = true;
          break;
        }
      }
      done ? null : reject('can\'t find pkg:'+dep);
    });
  },deps)).then(function(argv){
    return Promise.resolve(R.compose(R.uniq,R.flatten)(argv));
  }).catch(console.error);
}

module.exports = function(name){
  return new Promise(function(resolve){
    Deps(name || '.').then(function(ary){
      resolve(R.map(v=>v+"/**/*",ary));
    });
  });
}
