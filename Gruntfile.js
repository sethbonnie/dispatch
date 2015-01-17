module.exports = function( grunt ) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON( 'package.json' ),
    
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
    },

    mochaTest: {
      all: {
        src: ['test/**/*.js']
      }
    },

    concat: {
      dist: {
        src: ['src/*.js'],
        dest: 'dist/dispatch.pre.js',
      }
    },

    uglify: {
      dist: {
        files: {
          'dist/dispatch.js': ['dist/dispatch.pre.js']
        }
      } 
    },

    clean:  ['dist/*.pre.js']
  });

  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-concat' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-contrib-clean' );
  grunt.loadNpmTasks( 'grunt-mocha-test' );

  // Register task(s).
  grunt.registerTask( 'test', ['jshint:all', 'mochaTest:all']);
  grunt.registerTask( 'default', ['test', 'concat', 'uglify', 'clean'] );

};