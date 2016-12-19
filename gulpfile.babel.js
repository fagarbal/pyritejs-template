import gulp  from 'gulp';
import babelify   from 'babelify';
import browserify from 'browserify';
import buffer     from 'vinyl-buffer';
import source     from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import stringify from 'stringify';
import browserSync from 'browser-sync';
import runSequence from 'run-sequence';
import babelConfig from './babelrc.json';

gulp.task('build:js', () =>
	browserify('test2/app.js', { debug: true })
	.transform(stringify(['.html']))
	.transform(babelify, babelConfig)
	.bundle()
	.pipe(source('app.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
	.pipe(gulp.dest('dist/'))
);

gulp.task('copy:html', () => 
	gulp.src('test2/index.html')
    .pipe(gulp.dest('dist/'))
);

gulp.task('serve',() => {
	runSequence('build:js', 'copy:html', 'browser-sync', () => {
		gulp.watch(['node_modules/pyrite/lib/**/*.js'], ['build:js', browserSync.reload]);
		gulp.watch(['test2/**/*.js','test2/**/*.html'], ['build:js', 'copy:html', browserSync.reload]);
	});
});

gulp.task('browser-sync', () => 
  browserSync({
    server: {
      baseDir: './dist'
    }
  })
);

gulp.task('default', ['serve']);