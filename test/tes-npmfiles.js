var assert = require('assert');
var path = require('path');
var gnf = require('../npm-files.js');
var R = require('ramda');
var spawn = require('child_process').spawn;
var fs = require('fs');

describe('RecordDep', function() {
  it('should return package list', function() { 
    return gnf().then(function(lists) {
      var requirelist = ['./node_modules/gulp', './node_modules/ramda', './node_modules/ramda/node_modules/js-downloader'].map(function(p) {
        return path.resolve(__dirname,p,'**/*');
      });
      assert.deepEqual(lists,requirelist);
    });
  });
  it('unique test', function() {
    return gnf().then(function(lists) {
      assert(lists.length === R.uniq(lists).length);
    });
  })
});

describe('Package', function() {
  it('make iss file', function() {
    return new Promise(function(resolve, reject) {
      spawn('node', ['../cli.js', '--make-iss']).on('close', function(code) {
        if (code === 0) resolve(code);
        else reject(code);
        assert(code === 0);
      });
    });
  }).timeout(5000);
  it('package win32-ia32', function() {
    return new Promise(function(resolve, reject) {
      spawn('node', ['../cli.js', './example.iss', '--platform', 'win32-ia32']).on('close', function(code) {
        if (code === 0) resolve(code);
        else reject(code);
        assert(code === 0);
        assert(fs.existsSync('./release/setup.exe'));
      });
    }); 
  }).timeout(5*60*1000);
});
