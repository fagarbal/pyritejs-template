var gulp  = require('gulp');
var babelify   = require('babelify');
var browserify = require('browserify');
var buffer     = require('vinyl-buffer');
var source     = require('vinyl-source-stream');

gulp.task('build:js', () =>
	browserify({
		entries: ['app/index.js']
	})
	.transform(babelify, { presets: ['es2015'] })
	.bundle()
	.pipe(source('example.js'))
	.pipe(buffer())
	.pipe(gulp.dest('dist/'))
);