var gulp = require('gulp'),
    // Generic imports
    gutil = require('gulp-util'),
    path = require('path'),
    clean = require('rimraf'),
    // Browserify-related imports
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    reactify = require('reactify'),
    // LESS-related imports
    less = require('gulp-less'),
    sourcemaps = require('gulp-sourcemaps'),
    // HTML-related imports
    minify = require('gulp-minify-html'),
    // Dev-server-related imports
    nodemon = require('nodemon');

var helpers = {
    rebundle: function(bundler) {
        gutil.log('Re-bundling client js');
        bundler
            .bundle()
            .pipe(source(path.join(__dirname, 'main.js')))
            .pipe(gulp.dest(path.join(__dirname, 'client', 'dist', 'js')));
    }
};

// Compiles the client js
gulp.task('browserify', function() {
    var bundler = browserify({
        cache: {},
        packageCache: {},
        fullPaths: true
    });
    // React middleware for JSX
    bundler.transform(reactify);
    // Add the entry point
    bundler.add(path.join(__dirname, 'client', 'js', 'main.js'));
    // Perform initial rebundle
    return helpers.rebundle(bundler);
});

// Watches and recompiles client js
gulp.task('watchify', function() {
    var bundler = browserify({
        cache: {},
        packageCache: {},
        fullPaths: true,
        debug: true
    });
    // Pass the browserify bundler to watchify
    bundler = watchify(bundler);
    // React middleware for JSX
    bundler.transform(reactify);
    // Bundlize on updates
    bundler.on('update', function() {
        helpers.rebundle(bundler);
    });
    // Add the entry point
    bundler.add(path.join(__dirname, 'client', 'js', 'main.js'));
    // Perform initial rebundle
    return helpers.rebundle(bundler);
});

// Compiles the client less
gulp.task('less', function() {
    gulp.src(path.join('client', 'less', 'main.less'))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.join('client', 'dist', 'css')));
});

// Condenses the pages
gulp.task('pages', function() {
    gulp.src('./client/pages/*.html')
        .pipe(minify({
            empty: true,
            spare: true
        }))
        .pipe(gulp.dest(path.join('client', 'dist', 'pages')));
});

// Move the fonts to dist
gulp.task('fonts', function() {
    gulp.src('./client/fonts/**/*')
        .pipe(gulp.dest(path.join('client', 'dist', 'fonts')));
});

// Move the vendor to dist
gulp.task('vendor', function() {
    gulp.src('./client/vendor/**/*')
        .pipe(gulp.dest(path.join('client', 'dist', 'vendor')));
});

// Clears all compiled client code
gulp.task('clean', function() {
    clean.sync(path.join(__dirname, 'client', 'dist'));
});

// Watches changes to the client code
gulp.task('watch', ['clean', 'less', 'fonts', 'vendor', 'pages', 'watchify'], function() {
    gulp.watch('client/pages/*.html', ['pages']);
    gulp.watch('client/less/**/*.less', ['less']);
    gulp.watch('client/img/**/*', ['images']);
});

// Runs dev server and watches client code
gulp.task('dev', ['watch'], function() {
    nodemon({
        script: 'index.js',
        ext: 'js',
        ignore: ['client/*'],
        env: {
            PORT: 3000,
            DB: 'mongodb://localhost:27017/chronicle',
            SESSION_SECRET: 'thisisnotasecretatall'
        }
    });
});

// Run all compilation tasks
gulp.task('default', ['clean', 'less', 'fonts', 'vendor', 'pages', 'browserify']);
