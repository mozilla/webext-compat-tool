// ----------------------------------------------------------------------------------------
// Plugins
// ----------------------------------------------------------------------------------------

const gulp           = require('gulp');
const browserSync    = require('browser-sync');
const nodemon        = require('gulp-nodemon');
const sass           = require('gulp-sass');
const sourcemaps     = require('gulp-sourcemaps');
const autoprefixer   = require('gulp-autoprefixer');
const cleancss       = require('gulp-clean-css');
const rename         = require('gulp-rename');


// ----------------------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------------------

const src = {
  sass     : 'styles/**/*.scss',
};

const dist = {
  css      : 'static',
};



// ----------------------------------------------------------------------------------------
// Tasks
// ----------------------------------------------------------------------------------------

// Task: nodemon
// starts node server
gulp.task('nodemon', (cb) => {

	let started = false;

	return nodemon({ script: 'server.js' }).on('start', () => {
		if (!started) {
			cb();
			started = true;
		}
	});
});

// Task: browser-sync
// Proxies node server and watches files for hot-reloading
gulp.task('browser-sync', gulp.series('nodemon', () => {
	browserSync.init(null, {
		proxy: "http://localhost:8080",
        files: ['static/**/*.{html,js,css}'],
        port: 7000,
	});
}));

// Task: sass
// sourcemaps, compile, minify, rename, move to dist
gulp.task('sass', () => {
  gulp.src(src.sass)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dist.css))
    .pipe(browserSync.reload({ stream: true }));
});

// Task: sass-prod
// sourcemaps, compile, minify, rename, move to dist
gulp.task('sass-prod', () => {
  gulp.src(src.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleancss())
    .pipe(gulp.dest(dist.css))
});

// Task: build
// For Prod. Builds scss files.
gulp.task('build', gulp.series('sass-prod', () => {
}));

// Task: Watch
// watches sass files and re-compiles on change
gulp.task('watch', gulp.series('browser-sync', 'sass', () => {
  gulp.watch(src.sass, 'sass');
}));


// Task: default
// For Development. Starts server, watches files, hot-reloads
gulp.task('default', gulp.series('watch', () => {
}));
