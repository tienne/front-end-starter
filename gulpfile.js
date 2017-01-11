// /**
//  * Dependencies
//  * -----------------------------------------------------------------------------
//  */
const path = require('path');

const gulp = require('gulp');
const autoprefixer = require('autoprefixer');
const livereload = require('browser-sync');
const sequence = require('run-sequence');
const changed = require('gulp-changed');
const include = require('gulp-include');
const postcss = require('gulp-postcss');
const nano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const del = require('del');
const bower = require('gulp-main-bower-files');
const filter = require('gulp-filter');
const concat = require('gulp-concat');
const cssmin = require('gulp-cssmin');
/**
 * Set paths
 * -----------------------------------------------------------------------------
 */
const config = {
  build: path.join(__dirname, 'dist'),
  src: path.join(__dirname, 'src'),
  bower: path.join(__dirname, 'bower_components'),
  node: path.join(__dirname, 'node_modules'),
};

/**
 * Set build options
 * -----------------------------------------------------------------------------
 */

// const options = minimist(process.argv.slice(2), {
//   string: ['env'],
//   default: {
//     env: 'dev',
//   },
// });

gulp.task('vendor:js',() => {
  let jsFilter = filter('**/*.js', {restore:true});

  gulp.src('./bower.json')
    .pipe(bower())
    .pipe(jsFilter)
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest(`${config.build}/js`));
});

gulp.task('vendor:css',() => {
  let cssFilter = filter('**/*.css', {restore:true});

  gulp.src('./bower.json')
    .pipe(bower())
    .pipe(cssFilter)
    .pipe(concat('vendor.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(`${config.build}/css`));

});

gulp.task('clean', () => del(config.build));

/**
 * Build scripts with transpilers
 * -----------------------------------------------------------------------------
 */
gulp.task('scripts', () => gulp
  .src(`${config.src}/js/*.js`)
  // Save unminified file
  .pipe(include())
  .pipe(gulp.dest(`${config.build}/js`))
  // Optimize and minify
  .pipe(uglify())
  // Append suffix
  .pipe(rename({
    suffix: '.min',
  }))
  // Save minified file
  .pipe(gulp.dest(`${config.build}/js`))
);

/**
 * Build styles with pre-processors and post-processors
 * -----------------------------------------------------------------------------
 */
gulp.task('sass', () => gulp
  .src(`${config.src}/sass/*.sass`)
  .pipe(sass({
    outputStyle: 'expanded',
  }))
  // Add vendor prefixes
  .pipe(postcss([
    autoprefixer,
  ]))
  // Save unminified file
  .pipe(gulp.dest(`${config.build}/css`))
  // Optimize and minify
  .pipe(nano())
  // Append suffix
  .pipe(rename({
    suffix: '.min',
  }))
  // Save minified file
  .pipe(gulp.dest(`${config.build}/css`))
);

gulp.task('html', () => {
  return gulp.src(`${config.src}/**/*.html`)
    .pipe(gulp.dest(`${config.build}`));
});


gulp.task('server', () => {
  // Create and initialize local server
  livereload.create();
  livereload.init({
    notify: false,
    server: `${config.build}`,
    open: 'local',
    ui: false,
  });
  // Watch for build changes and reload browser
  livereload.watch(`${config.build}/**/*`).on('change', livereload.reload);
  // Watch for source changes and execute associated tasks

  gulp.watch(`${config.src}/fonts/**/*`, ['fonts']);
  gulp.watch(`${config.src}/images/**/*`, ['images']);
  gulp.watch(`${config.src}/js/**/*.js`, ['scripts']);
  gulp.watch(`${config.src}/sass/**/*.sass`, ['sass']);
  gulp.watch(`./bower.json`, ['vendor:js', 'vendor:css']);
  gulp.watch(`${config.src}/*.html`, ['html']).on('change', livereload.reload);
  //
}); 

/**
 * Build static assets
 * -----------------------------------------------------------------------------
 */
gulp.task('assets', (callback) => sequence(
  ['fonts'],
  ['images'],
  callback
));

gulp.task('images', () => gulp
  // Select files
    .src(`${config.src}/images/**/*`)
    // Check for changes
    .pipe(changed(`${config.build}/images`))
    // Save files
    .pipe(gulp.dest(`${config.build}/images`))
);

gulp.task('fonts', () => gulp
  .src(`${config.src}/fonts/**/*`)
  // Check for changes
  .pipe(changed(`${config.build}/fonts`))
  // Save files
  .pipe(gulp.dest(`${config.build}/fonts`))
);

gulp.task('build', (callback) => sequence(
  ['clean'],
  ['assets'],
  ['scripts'],
  ['sass'],
  ['vendor:js'],
  ['vendor:css'],
  ['html'],
  callback
));

gulp.task('default', (callback) => sequence(
  ['build'],
  ['server'],
  callback
));
