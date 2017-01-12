var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var glob = require('glob');
var gulp = require('gulp');
var path = require('path');
var _ = require('lodash');
var debug = require('gulp-debug');
var sass = require('gulp-sass');
const fs = require('fs');
var $ = require('gulp-load-plugins')({ lazy: true });

var colors = $.util.colors;
var envenv = $.util.env;

/**
 * yargs variables can be passed in to alter the behavior, when present.
 * Example: gulp serve-dev
 *
 * --verbose  : Various tasks will produce more output to the console.
 * --nosync   : Don't launch the browser with browser-sync when serving code.
 * --debug    : Launch debugger with node-inspector.
 * --debug-brk: Launch debugger and break on 1st line with node-inspector.
 * --startServers: Will start servers for midway tests on the test task.
 */

/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/**
 * Compile less to css
 * @return {Stream}
 */
gulp.task('compil-less', ['clean-styles'], function() {
  log('Compiling Less --> CSS');

  return gulp
    .src(config.less)
    .pipe($.plumber()) // exit gracefully if something fails after this
    .pipe($.less())
    //        .on('error', errorLogger) // more verbose and dupe output. requires emit.
    .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
    .pipe(gulp.dest(config.temp));
});

/**
 * Compile less to css
 * @return {Stream}
 */
gulp.task('compil-scss', ['clean-styles'], function() {
  log('Compiling SASS --> CSS');

  return gulp
    .src(config.sass)
    .pipe($.plumber()) // exit gracefully if something fails after this
    .pipe($.sass())
    //        .on('error', errorLogger) // more verbose and dupe output. requires emit.
    .pipe($.autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
    .pipe(gulp.dest(config.temp));
});

/**
 * Copy fonts
 * @return {Stream}
 */
gulp.task('fonts', ['clean-fonts'], function() {
  log('Copying fonts');

  return gulp
    .src(config.fonts)
    .pipe(gulp.dest(config.build + 'fonts'));
});

/**
 * Compress images
 * @return {Stream}
 */
gulp.task('images', ['clean-images'], function() {
  log('Compressing and copying images');

  return gulp
    .src(config.images)
    .pipe($.imagemin({ optimizationLevel: 4 }))
    .pipe(gulp.dest(config.build + 'images'));
});

gulp.task('less-watcher', function() {
  gulp.watch([config.less], ['styles']);
});

/**
 * Create $templateCache from the html templates
 * @return {Stream}
 */
gulp.task('templatecache', ['clean-code'], function() {
  log('Creating an AngularJS $templateCache');

  return gulp
    .src(config.htmltemplates)
    .pipe($.if(args.verbose, $.bytediff.start()))
    .pipe($.minifyHtml({ empty: true }))
    .pipe($.if(args.verbose, $.bytediff.stop(bytediffFormatter)))
    .pipe($.angularTemplatecache(
      config.templateCache.file,
      config.templateCache.options
    ))
    .pipe(gulp.dest(config.temp));
});

/**
 * Wire-up the bower dependencies
 * @return {Stream}
 */
gulp.task('wiredep', function() {
  log('Wiring the bower dependencies into the html');

  var wiredep = require('wiredep').stream;
  var options = config.getWiredepDefaultOptions();

  // Only include stubs if flag is enabled
  var js = args.stubs ? [].concat(config.js, config.stubsjs) : config.js;

  return gulp
    .src(config.index)
    .pipe(wiredep(options))
    .pipe(inject(js, '', config.jsOrder))
    .pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'compil-scss', 'templatecache'], function() {
  log('Wire up css into the html, after files are ready');

  return gulp
    .src(config.index)
    .pipe(inject(config.css))
    .pipe(gulp.dest(config.client));
});

function log(msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.green(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.green(msg));
  }
}

/**
 * Remove all files from the build, temp, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function(done) {
  var delconfig = [].concat(config.build, config.temp, config.report);
  log('Cleaning: ' + $.util.colors.blue(delconfig));
  del(delconfig, done);
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-fonts', function(done) {
  clean(config.build + 'fonts/**/*.*', done);
});

/**
 * Remove all images from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-images', function(done) {
  clean(config.build + 'images/**/*.*', done);
});

/**
 * Remove all styles from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-styles', function(done) {
  var files = [].concat(
    config.temp + '**/*.css',
    config.build + 'styles/**/*.css'
  );
  clean(files, done);
});

/**
 * Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function(done) {
  var files = [].concat(
    config.temp + '**/*.js',
    config.build + 'js/**/*.js',
    config.build + '**/*.html'
  );
  clean(files, done);
});

/**
 * Inject files in a sorted sequence at a specified inject label
 * @param   {Array} src   glob pattern for source files
 * @param   {String} label   The label name
 * @param   {Array} order   glob pattern for sort order of the files
 * @returns {Stream}   The stream
 */
function inject(src, label, order) {
  var options = { read: false , relative: true};
  if (label) {
    options.name = 'inject:' + label;
  }

  return $.inject(orderSrc(src, order), options);
}

/**
 * Order a stream
 * @param   {Stream} src   The gulp.src stream
 * @param   {Array} order Glob array pattern
 * @returns {Stream} The ordered stream
 */
function orderSrc(src, order) {
  //order = order || ['**/*'];
  return gulp
    .src(src)
    .pipe($.if(order, $.order(order)));
}

/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path, done) {
  log('Cleaning: ' + $.util.colors.blue(path));
  del(path, done);
}

/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
  var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
  return data.fileName + ' went from ' +
    (data.startSize / 1000).toFixed(2) + ' kB to ' +
    (data.endSize / 1000).toFixed(2) + ' kB and is ' +
    formatPercent(1 - data.percent, 2) + '%' + difference;
}

module.exports = gulp;
