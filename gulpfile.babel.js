'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel'); 
const plugins = require('gulp-load-plugins')();
const yargs = require('yargs');
const browserSync = require('browser-sync').create();
const rimraf = require('rimraf');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const dateFormat = require('dateformat');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const named = require('vinyl-named');
const log = require('fancy-log');
const colors = require('ansi-colors');
const ngAnnotate = require('gulp-ng-annotate');
const dependents = require('gulp-dependents');
const htmlmin = require('gulp-htmlmin');
const cached = require('gulp-cached');
const uglify = require('gulp-uglify');
const sassInheritance = require('gulp-sass-parent');

const sass = require('gulp-sass')(require('sass'));
const env = process.env;

// Load all Gulp plugins into one variable
const $ = plugins;

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
const { BROWSERSYNC, COMPATIBILITY, REVISIONING, PATHS } = loadConfig();

// Load default or custom YML config file
function loadConfig() {
  log('Loading config file...');

  log('loading ', colors.bold(colors.cyan('config.yml')));
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf(PATHS.dist, done);
}

// Copy files out of the assets folder with basic optimization
// This task skips over the "images", "js", and "scss" folders, which are parsed separately
function copy() {
  return gulp.src(PATHS.assets, { base: 'src' })
    .pipe(gulp.dest(PATHS.dist + '/assets'));
}

// Minify HTML with aggressive optimization
function appMinifyHTML() {
  if (env.NODE_ENV === 'production') {
    var manifest = fs.readFileSync('public/dist/assets/css/rev-manifest.json');
  }

  return gulp.src(['public/**/*.html', '!public/dist/**/*'])
    .pipe(cached('html'))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      removeAttributeQuotes: true,
      removeOptionalTags: env.NODE_ENV === 'production'
    }))
    .pipe(gulp.dest(PATHS.dist));
}

// Compile AppSass into CSS with optimization
// In production, the CSS is compressed and optimized
function appSass() {
  return gulp.src('src/assets/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe(sass({
      style: 'compressed',
      sourceComments: false,
      includePaths: PATHS.sass,
      quietDeps: true,
      verbose: false,
      outputStyle: 'compressed',
      silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-module-compat', 'slash-div'],
      logger: {
        warn: function() {}, // Suppress all warnings
        debug: function() {} // Suppress debug messages
      }
    })
    .on('error', sass.logError))
    .pipe($.autoprefixer({
      overrideBrowserslist: COMPATIBILITY
    }))
    .pipe($.cleanCss({ 
      compatibility: 'ie9',
      level: 2, // Advanced optimizations
      inline: ['none'], // Don't inline @import
      rebase: false // Don't rebase URLs
    }))
    .pipe($.if(env.NODE_ENV !== 'production', $.sourcemaps.write('../maps/css/')))
    .pipe($.if(env.NODE_ENV === 'production', $.rev()))
    .pipe(gulp.dest(PATHS.dist + '/assets/css'))
    .pipe($.if(env.NODE_ENV === 'production', $.rev.manifest()))
    .pipe(gulp.dest(PATHS.dist + '/assets/css'));
}

// Watch for Sass changes
function watchSass() {
  return gulp.src(
    [ 
      'src/assets/scss/app.scss',
    ]
  )
  .pipe(sass({
    includePaths: PATHS.sass,
    quietDeps: true,
    verbose: false,
    silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-module-compat', 'slash-div'],
    logger: {
      warn: function() {}, // Suppress all warnings
      debug: function() {} // Suppress debug messages
    }
  })
  .on('error', sass.logError))
  .pipe(gulp.dest(PATHS.dist + '/assets/css'))
  .pipe(browserSync.reload({ stream: true }));
}

function pluginSass() {
  return gulp.src(['src/assets/scss/plugins/plugins.scss'])
    .pipe($.sourcemaps.init())
    .pipe(sass({
      includePaths: PATHS.sass,
      quietDeps: true,
      verbose: false,
      silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-module-compat', 'slash-div'],
      logger: {
        warn: function() {}, // Suppress all warnings
        debug: function() {} // Suppress debug messages
      }
    })
    .on('error', sass.logError))
    .pipe($.autoprefixer({
      overrideBrowserslist: COMPATIBILITY
    }))
    .pipe($.cleanCss({ compatibility: 'ie9' }))
    .pipe($.sourcemaps.write('../maps/css/'))
    .pipe(gulp.dest(PATHS.dist + '/assets/css'));
}

// Uglify JavaScript
function appUglifyJS() {
  return gulp.src(['public/**/*.js', '!public/dist/**/*'])
    .pipe(cached('javascript'))
    .pipe($.sourcemaps.init({ loadMaps: true, largeFile: true }))
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(ngAnnotate({ add: true, map: { inline: false, sourcesContent: true }, es6: true }))
    .pipe($.if(env.NODE_ENV === 'production', uglify()))
    .on('end', () => { log('Done uglifying...'); })
    .pipe($.sourcemaps.write('/assets/maps/js/'))
    .pipe(gulp.dest(PATHS.dist));
}

// Copy fonts efficiently
function fonts() {
  return gulp.src('src/assets/fonts/**/*')
    .pipe(gulp.dest(PATHS.dist + '/assets/fonts'));
}

// Copy JavaScript files from src/assets/js to dist
function copySourceJS() {
  return gulp.src('src/assets/js/**/*.js')
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

// Webpack configuration
const webpackConfig = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: /node_modules(?![\\\/]foundation-sites)/,
      },
    ],
  },
  externals: { jquery: 'jQuery' },
};

function webpackBuild() {
  return gulp.src(PATHS.entries)
    .pipe(named())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe($.if(PRODUCTION, $.uglify().on('error', e => { console.log(e); })))
    .pipe($.if(REVISIONING && PRODUCTION || REVISIONING && DEV, $.rev()))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'))
    .pipe($.if(REVISIONING && PRODUCTION || REVISIONING && DEV, $.rev.manifest()))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

function webpackWatch() {
  const watchConfig = Object.assign(webpackConfig, { watch: true, devtool: 'inline-source-map' });
  return gulp.src(PATHS.entries)
    .pipe(named())
    .pipe(webpackStream(watchConfig, webpack, (err, stats) => {
      log('[webpack]', stats.toString({ colors: true }));
      browserSync.reload();
    }))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

// Copy and optimize images to the "dist" folder
function images() {
  return gulp.src('src/assets/img/**/*')
    .pipe(gulp.dest(PATHS.dist + '/assets/img'))
    .pipe(browserSync.reload({ stream: true }));
}

// Create a .zip archive of the theme
function archive() {
  const time = dateFormat(new Date(), "yyyy-mm-dd_HH-MM");
  const pkg = JSON.parse(fs.readFileSync('./package.json'));
  const title = `${pkg.name}_${time}.zip`;

  return gulp.src(PATHS.package)
    .pipe($.zip(title))
    .pipe(gulp.dest('packaged'));
}

// PHP Code Sniffer task
gulp.task('phpcs', function() {
  return gulp.src(PATHS.phpcs)
    .pipe($.phpcs({ bin: 'wpcs/vendor/bin/phpcs', standard: './codesniffer.ruleset.xml', showSniffCode: true }))
    .pipe($.phpcs.reporter('log'));
});

// PHP Code Beautifier task
gulp.task('phpcbf', function () {
  return gulp.src(PATHS.phpcs)
  .pipe($.phpcbf({ bin: 'wpcs/vendor/bin/phpcbf', standard: './codesniffer.ruleset.xml', warningSeverity: 0 }))
  .on('error', log)
  .pipe(gulp.dest('.'));
});

// Start BrowserSync to preview the site in
function server(done) {
  browserSync.init({ proxy: BROWSERSYNC.url, port: 6500, ui: { port: 8080 } });
  done();
}

// Reload the browser with BrowserSync
function reload(done) {
  browserSync.reload();
  done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch(done) {
  gulp.watch(PATHS.assets, copy);
  gulp.watch('src/assets/scss/**/*.scss', gulp.series(watchSass, pluginSass, fonts));
  gulp.watch('src/assets/js/**/*.js', copySourceJS); // Watch for changes in src JS files
  gulp.watch('public/**/*.html', gulp.series(appMinifyHTML, reload));
  gulp.watch('src/assets/img/**/*', gulp.series(images, reload));
  gulp.watch('public/**/*.js', appUglifyJS);
  done();
}

// Build the "dist" folder by running all of the below tasks
gulp.task('build', gulp.series(clean, appSass, pluginSass, gulp.parallel(appMinifyHTML, appUglifyJS, webpackBuild, images, copy, fonts, copySourceJS)));

// Build the site, run the server, and watch for file changes
gulp.task('default', gulp.series('build', server, gulp.parallel(webpackWatch, watch)));


// Package task
gulp.task('package', gulp.series('build', archive));
