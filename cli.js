#!/usr/bin/env node
const spawn = require('child_process').spawn;

function print_usag_and_exit(){
  console.log(`usag:\n\t${process.argv[0] setup.ino}`);
  process.exit(1);
}

if(process.argv<2) print_usag_and_exit();

spawn('gulp --gulpfile inno')
