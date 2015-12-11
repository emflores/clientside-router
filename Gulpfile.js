const mocha = require('gulp-mocha');
const gulp = require('gulp');
const path = require('path');

const TEST_TARGET = path.join(__dirname, 'test/*.spec.js');

gulp.task('test', function() {
  gulp.src(TEST_TARGET)
    .pipe(mocha({
      reporter: 'spec'
    }));
});
