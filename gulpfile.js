var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    minifyHTML = require('gulp-minify-html'),
    spawn = require('child_process').spawn,
    gutil = require('gulp-util');



/** Major Tasks **/

// Default
gulp.task('default', ['build', 'connect'], function () {
    gulp.watch(['src/**/*.*js'], ['js']);
    gulp.watch(['src/**/*.html'], ['html']);
    gulp.watch(['src/css/**/*.*scss'], ['css']);
    gulp.watch(['bower_components', 'index.html'], ['copy']);
    gulp.watch(['index.html', 'dist/**/**.*'], function (event) {
        return gulp.src(event.path)
            .pipe($.connect.reload());
    });
});

gulp.task('parse', ['build', 'parse-no-build'], function(){
  // to be run from the command line
});

// can be inserted as dependency after a build task
gulp.task('parse-no-build', function(){
  gulp.src('dist/**')
  .pipe(gulp.dest('parse/public'));
});

// Test
gulp.task('test', ['casperTest'], function () {

});


/** Sub Tasks **/

// Build
gulp.task('build', ['js', 'html', 'css', 'copy']);

// JS
gulp.task('js', function () {
    gulp.src(['src/components/base/Class.js', 'src/components/base/*', 'src/**/*.*js'])
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.concat('app.js'))
        //.pipe($.ngAnnotate())
        // .pipe($.uglify())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

// HTML
gulp.task('html', function () {
    gulp.src('src/partials/**/*.*html')
        .pipe(minifyHTML())
        .pipe(gulp.dest('dist/partials'));
});

// CSS
gulp.task('css', function () {
        $.rubySass('src/css/main.scss', {quiet: true})
        .pipe($.autoprefixer("last 2 versions", "> 1%"))
        .pipe(gulp.dest('dist/css'));
});

// Copy
gulp.task('copy', function () {
    gulp.src([
        'bower_components/angular/angular.min.*',
        'bower_components/angular-cookies/angular-cookies.min.*',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js',
        'bower_components/angular-animate/angular-animate.min.*'
    ]).pipe(gulp.dest('dist/bower_components'));

    gulp.src(['fonts/**/**']).pipe(gulp.dest('dist/font'));
    gulp.src(['index.html']).pipe(gulp.dest('dist'));
    gulp.src(['images/**/**']).pipe(gulp.dest('dist/images'));

});


// Connect  - Port 8002
gulp.task('connect', function () {
    $.connect.server({
        root: [__dirname + "/dist"],
        port: 8002,
        livereload: {port: 2983}
    });
});

// Casper Tests

gulp.task('casperTest', function () {
    var tests = ['tests/casper/casperTest.js', 'tests/casper/resurrectioTest.js'];

    var casperChild = spawn('casperjs', ['test'].concat(tests));

    casperChild.stdout.on('data', function (data) {
        gutil.log('CasperJS:', data.toString().slice(0, -1));
    });

    casperChild.on('close', function (code) {
        var success = code === 0; // Will be 1 in the event of failure
        // Do something with success here
    });
});
