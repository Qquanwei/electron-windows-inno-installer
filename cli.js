#!/usr/bin/env node
"use strict"


const spawn = require('child_process').spawn;
const path = require('path');
const pkg = require('./package.json');
const fs = require('fs');


function print_usag_and_exit() {
  console.log(`usag:\n\telectron-window-inno-installer [options] issfile`);
  console.log('options:');
  console.log('\t--help:\n\t\tprint this message and exit');
  console.log('\t--path path:\n\t\tset work directory');
  console.log('\t--platform plats\n\t\tset prebuild platforms,like\'s win32-x64,darwin-x64');
  console.log('\t--icon iconpath\n\t\tset exefile icon');
  console.log('\t--make-iss make template file for inno iss');
  console.log('\t--version\n\t\tprint version');
  process.exit(1);
}

if (process.argv.length < 3) print_usag_and_exit();

let options = {
  'platform': 'win32-x64',
};
let argv = Array.prototype.concat([], process.argv);

function error(cond,msg){
  if(cond){
    console.error('error: ',msg);
    print_usag_and_exit();
  }
}

while (argv.length) {
  switch (argv[0]) {
    case '--help':
      print_usag_and_exit();
      break;
    case '--path':
      argv.shift();
      error(argv.length===0,'require path');
      options['path'] = argv[0].startsWith('/') ? argv[0] : path.resolve(process.cwd(),argv[0]);
      break;
    case '--platform':
      argv.shift();
      error(argv.length===0,'require platform');
      options['platform']=argv[0];
      break;
    case '--icon':
      argv.shift();
      error(argv.length===0,'require icon');
      options['icon']=(argv[0].startsWith('/')? argv[0] : path.resolve(process.cwd(),argv[0]));
      break;
    case '--make-iss':
      spawn('cp',[path.resolve(path.dirname(__filename),'example.iss'),process.cwd()],{stdio:'inherit' });
      console.log('success: output ./example.iss');
      process.exit(0);
      break;
    case '--version':
      console.log(pkg.version);
      process.exit(0);
      break;
    default:
      options['issfile'] = argv[0];
  }
  argv.shift();
}

if(!(options.issfile&&fs.existsSync(options.issfile))){
  console.error('error:  required issfile or issfile not exists\n');
  print_usag_and_exit();
}

process.env.INNOFILE=options.issfile;
process.env.PLATFORMS=options.platform;
process.env.ICON=options.icon;

options.path&&process.chdir(options.path);

const gulpfile = path.resolve(path.dirname(__filename),'gulpfile.js');

process.NODE_ENV = 'test';

spawn('gulp', [`--gulpfile=${gulpfile}`,`--cwd=${process.cwd()}`,'inno'], { stdio: 'inherit' }).on('close',function(code){
  process.exit(code);
});
