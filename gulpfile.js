var gulp = require('gulp')
var inno = require('gulp-inno');
var electron = require('gulp-electron');
var fs = require('fs');

var gnf = require('./npm-files')
var electronVersion = require('./package.json').electronVersion;
var pkg = require(`${process.cwd()}/package.json`)
var compileDir = './compile';

gulp.task('version', function(){
  // FIXME(ssx): https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md
  var pkg = require(`${process.cwd()}/package.json`);
  fs.writeFileSync('version.json', JSON.stringify({
    version: pkg.version,
  }))
})

gulp.task('copy', ['version', 'copy:modules'], function(){
  return gulp.src( pkg.sourceFiles || ['*.*'], 
    {base: process.cwd()})
    .pipe(gulp.dest(compileDir))
})

gulp.task('copy:modules', function(){
  return gulp.src(gnf(), {base: './'}).pipe(gulp.dest(compileDir))
})

gulp.task('electron', ['copy'], function() {
  return gulp.src("")
    .pipe(electron({
      src: './compile',
      release: './release',
      cache: './.cache',
      packageJson: pkg,
      packaging: false,
      version: electronVersion,
      platforms: process.env.PLATFORMS.split(','), 
      asar: true,
      asarUnpackDir: 'vendor',
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

gulp.task('inno', ['electron'], function(){
  return gulp.src(process.env.INNOFILE).pipe(inno());
})

gulp.task('default', ['copy'])
