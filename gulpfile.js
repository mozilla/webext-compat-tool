// ----------------------------------------------------------------------------------------
// Plugins
// ----------------------------------------------------------------------------------------

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');

// ----------------------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------------------

const src = {
  sass: 'styles/**/*.scss',
};

const dist = {
  css: 'static',
};

// ----------------------------------------------------------------------------------------
// Tasks
// ----------------------------------------------------------------------------------------

// Task: sass-prod
gulp.task('sass-prod', () => {
  return gulp
    .src(src.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleancss())
    .pipe(gulp.dest(dist.css));
});

// Task: build
// For Prod. Builds scss files.
gulp.task('build', gulp.series('sass-prod'));
