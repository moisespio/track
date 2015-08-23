var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
var uncss = require('gulp-uncss');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');

var base = './';

var AUTOPREFIXER_BROWSERS = [
	'ie >= 9',
	'ie_mob >= 10',
	'ff >= 30',
	'chrome >= 34',
	'safari >= 7',
	'opera >= 23',
	'ios >= 7',
	'android >= 4.4',
	'bb >= 10'
];

gulp.task('styles', function() {
	return gulp.src([base + 'sources/sass/app.scss'])
		.pipe(sass())
		.pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
		// .pipe(uncss({
		// 	ignore: [/\.show/, /\.one.*/, /\.two.*/, /\.three.*/, /\.highlighted.*/],
		// 	html: ['index.html', 'app/views/login.html', 'app/views/timeline.html']
		// }))
		// .pipe(csso())
		.on('error', function(err) { console.log(err.message); })
		.pipe(gulp.dest(base + 'assets/stylesheets'))
		.pipe(livereload());
});

gulp.task('vendor', function() {
	return gulp.src([base + 'sources/javascripts/vendor/angular.min.js', base + 'sources/javascripts/vendor/*.js'])
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(base + 'assets/javascripts/vendor'))
		.pipe(livereload());
});

gulp.task('js', function() {
	return gulp.src([base + 'app/**/*.js', base + 'sources/javascripts/*.js'])
		.pipe(concat('all.js'))
		.pipe(gulp.dest(base + 'assets/javascripts'))
		.pipe(livereload());
});

gulp.task('watch', ['styles', 'vendor', 'js'], function() {
	livereload.listen();
	gulp.watch(base + 'sources/sass/**/*.scss', ['styles']);
	gulp.watch(base + 'sources/javascripts/vendor/*.js', ['vendor']);
	gulp.watch(base + 'sources/javascripts/*.js', ['js']);
	gulp.watch(base + 'app/**/*.js', ['js']);
});
