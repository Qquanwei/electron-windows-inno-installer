#!/usr/bin/env node

"use strict"

const spawn = require('child_process').spawn;
const path = require('path');

function print_usag_and_exit() {
  console.log(`usag:\n\telectron-window-inno-installer [options] issfile`);
  console.log('options:');
  console.log('\t--help:\n\t\tprint this message and exit');
  console.log('\t--path:\n\t\tset work directory');
  console.log('\t--platforms\n\t\tset prebuild platforms,like\'s win32-x64,darwin-x64');
  process.exit(1);
}

if (process.argv.length < 3) print_usag_and_exit();

let options = {'platforms':'win32-x64'};
let argv = Array.prototype.concat([], process.argv);

while (argv.length) {
  switch (argv[0]) {
    case '--help':
      print_usag_and_exit();
      break;
    case '--path':
      argv.shift();
      if (argv.length == 0) {
        console.error('error: requied path\n');
        print_usag_and_exit();
      }
      options['path'] = argv[0].startsWith('/') ? argv[0] : `${__dirname}${argv[0]}`;
      break;
    case '--platforms':
      argv.shift();
      if(argv.length==0){
        console.error('error: required platform\n');
        print_usag_and_exit();
      }
      options['platforms']=argv[0];
      break;
    default:
      options['issfile'] = argv[0];
  }
  argv.shift();
}

if(!options.issfile){
  console.error('error:  required issfile\n');
  print_usag_and_exit();
}

process.env.INNOFILE=options.issfile;
process.env.PLATFORMS=options.platforms;

if(options.path) process.chdir(options.path);
const gulpfile = path.resolve(path.dirname(__filename),'electron-inno-auto-update/gulpfile.js');

spawn('gulp', [`--gulpfile=${gulpfile}`,`--cwd=${process.cwd()}`,'inno'], { stdio: 'inherit' });
