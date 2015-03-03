var gulp   = require( 'gulp' );
var mocha  = require( 'gulp-mocha' );
var jshint = require( 'gulp-jshint' );
var uglify = require( 'gulp-uglify' );
var source = require( 'vinyl-source-stream' );
var streamify = require( 'gulp-streamify' );
var browserify = require( 'browserify' );

gulp.task( 'jshint', function() {

  gulp
    .src( ['gulpfile.js', './src/**/*.js', './test/*.js'])
    .pipe( jshint() )
    .pipe( jshint.reporter( 'default' ) );

});

gulp.task( 'test', ['jshint'], function() {

  gulp
    .src( 'test/**/*.js')
    .pipe( mocha() );

});

// Bundle and compress it all up with browserify + uglify
gulp.task( 'build', ['test'],  function() {

  browserify( './src/hub.js' )
    .bundle()
    .pipe( source( 'pubhub.js' ) )
    .pipe( streamify(uglify()) )
    .pipe( gulp.dest( './build' ) );

});

gulp.task( 'default', ['build'] );