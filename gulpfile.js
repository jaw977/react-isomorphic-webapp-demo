var gulp = require('gulp');
var coffee = require('gulp-coffee');
var plumber = require('gulp-plumber');

var path = {
  coffee: './src/*.coffee',
  out: './out'
};

gulp.task('coffee', function() {
  return gulp.src(path.coffee)
    .pipe(plumber())
    .pipe(coffee())
    .pipe(gulp.dest(path.out));
});

gulp.task('watch', function() {
  return gulp.watch(path.coffee, ['coffee']);
});

gulp.task('default', ['coffee', 'watch'], function() {});
