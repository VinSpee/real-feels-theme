var gulp       = require('gulp');
var env        = require('minimist')(process.argv.slice(2));
var connect    = require('connect');
var http       = require('http');
var browse     = require('open');
var coffeeify  = require('coffeeify');
var plugins    = require('gulp-load-plugins')();
var refresh    = require('gulp-livereload');
var lrserver   = require('tiny-lr')();
var path       = require('path');
var express    = require('express');
var livereload = require('connect-livereload');

if(env.theme) {
	var themeDir = env.theme;
} else {
	var themeDir = 'demo';
}

//config
var livereloadport = 35729;
var serverport     = 5000;
var server         = express();

//Add livereload middleware before static-middleware
server.use(livereload({
	port: livereloadport
}));

//Add static-middleware
server.use(express.static(path.resolve('./')));

var getSources = function() {
	//read theme and pick dir
	var sources = {
		styles       : 'themes/' + themeDir + '/app/styles/**/*.{sass,scss}',
		styles_dir   : 'themes/' + themeDir + '/app/styles/',
		scripts      : 'themes/' + themeDir + '/app/scripts/**/*.coffee',
		main_scripts : 'themes/' + themeDir + '/app/scripts/app.coffee',
		images       : 'themes/' + themeDir + '/app/images/**',
		templates    : 'themes/' + themeDir + '/app/templates/**/*.hbs',
		fonts        : 'themes/' + themeDir + '/app/fonts/*.*'
	};
	return sources;
};

var getDests = function() {
	//read theme and pick dir
	var dests = {
		styles    : 'themes/' + themeDir + '/build/styles/',
		scripts   : 'themes/' + themeDir + '/build/scripts/',
		images    : 'themes/' + themeDir + '/build/images/',
		html      : 'themes/' + themeDir + '/build/',
		templates : 'themes/' + themeDir + '/build/templates/',
		fonts     : 'themes/' + themeDir + '/build/fonts/'
	};
	return dests;
};

var handleError = function(err) {
	console.log(err.toString());
	this.emit('end');
};

gulp.task('scripts', function() {
	return gulp.src(getSources().main_scripts, {read: false})
		.pipe(plugins.coffeelint())
		.pipe(plugins.coffeelint.reporter())
		.pipe(plugins.browserify({
			transform: ['coffeeify'],
			extensions: ['.coffee'],
			debug: !env.production
		}))
		.pipe(plugins.concat('app.js'))
		.pipe(env.production ? plugins.uglify() : plugins.util.noop())
		.pipe(gulp.dest(getDests().scripts))
		.pipe(refresh(lrserver));
});

gulp.task('styles', function() {
	gulp.src(getSources().styles)
		.pipe(plugins.compass({
			require: ['singularitygs', 'modular-scale', 'toolkit', 'breakpoint'],
			sass: getSources().styles_dir,
			//sass: 'themes/realfeels/app/styles/',
			css: getDests().styles,
			image: getDests().images,
			font: getDests().fonts
		}))
		.on('error', handleError)
		.pipe(plugins.autoprefixer('last 2 version', '> 1%'))
		//.pipe(plugins.csslint({
			//'compatible-vendor-prefixes': false
		//}))
		.pipe(plugins.csslint.reporter())
		.pipe(env.production ? plugins.csso() : plugins.util.noop())
		.pipe(gulp.dest('build/styles'))
		.pipe(refresh(lrserver));
});

gulp.task('html', function() {
	return gulp.src(getSources().html)
		.pipe(plugins.htmlhint())
		.pipe(plugins.htmlhint.reporter())
		//.pipe(plugins.usemin)
		.pipe(plugins.htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('build/'));
});

gulp.task('images', function() {
	return gulp.src(getSources().images)
		.pipe(plugins.imagemin())
		.pipe(plugins.svgmin())
		.on('error', handleError)
		.pipe(gulp.dest(getDests().images))
		.pipe(refresh(lrserver));
});

gulp.task('fonts', function() {
	return gulp.src(getSources().fonts)
		.pipe(gulp.dest('getDests().fonts'));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
	gulp.watch(getSources().styles, ['styles']);
	gulp.watch(getSources().scripts, ['scripts']);
	gulp.watch(getSources().images, ['images']);
	//gulp.watch(sources.templates, ['templates']);
	//gulp.watch(sources.html, ['html']);
});

gulp.task('clean', function() {
	return gulp.src([getDests().scripts, getDests().styles, getDests().images, getDests().html, getDests().templates], {read: false})
		.pipe(plugins.clean());
});

gulp.task('server', function() {
	//Set up your static fileserver, which serves files in the build dir
	server.listen(serverport);
	//Set up your livereload server
	lrserver.listen(livereloadport);
});

// The default task (called when you run `gulp` from cli)
gulp.task('build', ['styles', 'scripts']);
gulp.task('default', ['build', 'server', 'watch']);
