module.exports = function(grunt) {

  // Project configuration.
// Project configuration.
grunt.initConfig({
	uglify: {
		options: {
			mangle: false
		},
		my_target: {
			files: {
				'script.min.js': ['js/events.js',
				'js/helpers.js',
				'js/main.js',
				'js/map.js',
				'js/map.js',
				'js/mongo.js']
			}
		}
	}
});

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};
