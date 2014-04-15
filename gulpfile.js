var gulp       = require('gulp');
var env        = require('minimist')(process.argv.slice(2));
var http       = require('http');
var coffeeify  = require('coffeeify');
var plugins    = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

if(env.theme) {
	var themeDir = env.theme;
} else {
	var themeDir = 'demo';
}

var getSources = function() {
	//read theme and pick dir
	var sources = {
		styles       : 'themes/' + themeDir + '/app/styles/**/*.{sass,scss}',
		styles_dir   : 'themes/' + themeDir + '/app/styles/',
		scripts      : 'themes/' + themeDir + '/app/scripts/**/*.coffee',
		main_scripts : 'themes/' + themeDir + '/app/scripts/app.coffee',
		images       : 'themes/' + themeDir + '/app/images/**',
		templates    : 'themes/' + themeDir + '/app/templates/**/*.hbs',
		fonts        : 'themes/' + themeDir + '/app/fonts/*.*',
		html         : 'themes/' + themeDir + '/app/*.html'
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
	gulp.src(getSources().main_scripts, {read: false})
		.pipe(plugins.coffeelint())
		.pipe(plugins.coffeelint.reporter())
		.pipe(plugins.browserify({
			transform: ['coffeeify'],
			extensions: ['.coffee'],
			debug: !env.production
		}))
		.pipe(plugins.concat('app.js'))
		.pipe(env.production ? plugins.uglify() : plugins.util.noop())
		.pipe(gulp.dest(getDests().scripts));
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
		.pipe(gulp.dest(getDests().styles));
});

gulp.task('html', function() {
	gulp.src(getSources().html)
		//.pipe(plugins.htmlhint())
		//.pipe(plugins.htmlhint.reporter())
		//.pipe(plugins.usemin)
		//.pipe(plugins.htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(getDests().html));
});

gulp.task('images', function() {
	gulp.src(getSources().images)
		.pipe(plugins.imagemin())
		.pipe(plugins.svgmin())
		.on('error', handleError)
		.pipe(gulp.dest(getDests().images));
});

gulp.task('fonts', function() {
	gulp.src(getSources().fonts)
		.pipe(gulp.dest('getDests().fonts'));
});

// Rerun the task when a file changes
gulp.task('watch', ['browser-sync'], function () {
	gulp.watch(getSources().styles, ['styles']);
	gulp.watch(getSources().scripts, ['scripts']);
	gulp.watch(getSources().images, ['images']);
	gulp.watch(getSources().html, ['html']);
	//gulp.watch(sources.templates, ['templates']);
});

gulp.task('clean', function() {
	return gulp.src([getDests().scripts, getDests().styles, getDests().images, getDests().html, getDests().templates], {read: false})
		.pipe(plugins.clean());
});

gulp.task('browser-sync', function() {
	browserSync.init([
		getDests().styles + '*.css',
		getDests().scripts + '*.js',
		getDests().html + '*.html'
	], {
		server: {
			baseDir: './'
		}
	});
});

// The default task (called when you run `gulp` from cli)
gulp.task('build', ['styles', 'scripts']);
gulp.task('default', ['build', 'watch']);
