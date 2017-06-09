module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dev: {
				options: {
					style: 'expanded'
				},
				files: {
					'public/css/main.css':'src/scss/main.scss'
				}
			}
		},
		uglify: {
			options: {
				mangle: false
			},
			components: {
				files: {
					'src/js/components.js': [
						'src/components/jquery/dist/jquery.min.js',
						'src/components/highcharts/highcharts.js'
					]
				}
			},
			js: {
				files: {
					'public/js/main.js': [
						'src/js/components.js',
						'src/js/modules/**/*.js',
						'src/js/highcharts-theme.js',
						'src/js/main.js',
					]
				}
			}
		},
		jshint: {
			options: {
				'-W069': true
			},
			main: ['src/js/main.js']
		},
		watch: {
			sass: {
				files: ['src/scss/**/*.scss'],
				tasks: ['sass:dev']
			},
			js: {
				files: ['src/js/**/*.js'],
				tasks: ['jshint:main','uglify:js']
			},
			components: {
				files: ['src/components/**/*'],
				tasks: ['uglify:components']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default',['watch']);
};