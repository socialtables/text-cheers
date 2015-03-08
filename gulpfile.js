var path = require('path');
var gulp = require('gulp');
var react = require('gulp-react');
var del = require('del');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var cssmin = require('gulp-cssmin');
var rename = require("gulp-rename");
var browserify = require("gulp-browserify");
var plumber = require("gulp-plumber");

var paths = {
  js: {
    src: "src/js/**/*",
    srcMain: "src/js/index.js",
    targetDir: "public/js"
  },
  jsx: {
    src: "src/jsx/*.jsx",
    targetDir: 'src/compiled-jsx'
  },
  less: {
    srcMain: 'src/less/style.less',
    allSrc: 'src/less/**/*',
    srcDir: 'src/less',
    targetDir: 'public/css'
  }

};

function deleteCompiledJSX(cb) {
  var compiledFiles = paths.jsx.targetDir + "/**/*.js";
  del([compiledFiles], cb);
};


// Remove compiled JSX (dev)
gulp.task('remove-compiled-jsx-dev', ['browserify'], function(cb) {
  deleteCompiledJSX(cb);
});

// Compile JSX to JS
gulp.task('compile-jsx', function() {
  return gulp.src(paths.jsx.src)
    .pipe(plumber())
    .pipe(react())
    .pipe(gulp.dest(paths.jsx.targetDir));
});

// Take the source JS and run browserify
gulp.task('browserify', ['compile-jsx'], function() {
  return gulp.src(paths.js.srcMain)
    .pipe(plumber())
    .pipe(browserify())
    .pipe(gulp.dest(paths.js.targetDir));
});

// Compile less
gulp.task('less', function() {
  
  return gulp.src(paths.less.srcMain)
    .pipe(plumber())
    .pipe(less({
      compress: true,
      paths: paths.less.srcDir
    }))
    .pipe(plumber())
    .pipe(cssmin())
    .pipe(rename({suffix: '.min' }))
    .pipe(gulp.dest(paths.less.targetDir));
});

// Rerun the task when a file changes
gulp.task('watch', ['scrub', 'build-dev'], function() {
  // gulp.watch(paths.less.allSrc, ['less']);
  gulp.watch([paths.jsx.src, paths.js.src], ['build-dev']);
});


gulp.task('build-dev', ['compile-jsx', 'browserify', 'remove-compiled-jsx-dev']);
gulp.task('scrub', ['remove-compiled-jsx-dev']);
gulp.task('dev', ['scrub', 'less', 'build-dev', 'watch']);
gulp.task('default', ['dev']);
