/*jshint esnext: true */

const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');
const gulp = require('gulp');
const path = require('path');

const TEST_TARGET = path.join(__dirname, 'test/*.spec.js');
const SCRIPTS_TARGET = path.join(__dirname, '*.js');

gulp.task('test', function() {
  gulp.src(TEST_TARGET)
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('cover', function() {
  gulp.src(SCRIPTS_TARGET)
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire())
    .on('finish', function() {
      gulp.src(TEST_TARGET)
        .pipe(mocha({
          reporter: 'spec'
        }))
        .pipe(istanbul.writeReports());
    });
});
