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
				'script.min.js': [
				'js/jquery.cookie.js',
				'js/mongo.js',
				'js/helpers.js',
				'js/map.js',
				'js/main.js',
				'js/events.js',
				]
			}
		}
	}
});

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};
