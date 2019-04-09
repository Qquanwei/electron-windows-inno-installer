"use strict"
var gulp = require('gulp')
var inno = require('gulp-inno');
var electron = require('gulp-electron');
var fs = require('fs');
var clean = require('gulp-clean');
var path = require('path');
var R = require('ramda');

var gnf = require('./npm-files');
var pkg = require(`${process.cwd()}/package.json`);
var compileDir = './compile';

gulp.task('version', function(){
  var pkg = require(`${process.cwd()}/package.json`);
  fs.writeFileSync('version.json', JSON.stringify({
    version: pkg.version,
  }))
})

gulp.task('copy', ['version','copy:modules'], function(){
  return gulp.src(
  	pkg.sourceFiles || ['**/**', '!node_modules/**/**', '!compile/**/**', '!release/**/**'],
    { base: './' }
  ).pipe(gulp.dest(compileDir));
});

gulp.task('copy:modules', function(){
  return new Promise(function(resolve,reject){
    gnf().then(function(src){
      gulp.src(src, { base : './' })
          .pipe(gulp.dest(compileDir))
          .on('end',resolve);
    });
  })
});

gulp.task('electron',['copy'], function() {
  return gulp.src("")
    .pipe(electron({
      src: './compile',
      release: './release',
      cache: './.cache',
      packageJson: pkg,
      packaging: true,
      version: process.env.ELECTRON_VERSION,
      platforms: process.env.PLATFORMS.split(','),
      asar: true,
      platformResources: {
        win: {
          "version-string": pkg.version,
          "file-version": pkg.version,
          "product-version": pkg.version,
          icon: process.env.ICON,
        },
      }
    }))
    .pipe(gulp.dest(""));
})

gulp.task('prevent', ['electron'], function() {
  return gulp.src(R.map(function(platform) {
    return path.resolve(process.cwd(), `release/${process.env.ELECTRON_VERSION}/${platform}/resources/app/`);
  }, process.env.PLATFORMS.split(','))
  ).pipe(clean({
  	force: true
  }));
});

gulp.task('inno', ['prevent'], function() {
  return gulp.src(process.env.INNOFILE).pipe(inno());
});

gulp.task('default', ['copy'])
