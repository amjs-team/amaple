const 
	customLaunchers = {
		sl_ie_11: {
			base: 'SauceLabs',
			browserName: 'internet explorer',
			platform: 'Windows 8.1',
			version: '11'
		}
	},
	path = require ( 'path' );

// Karma configuration
// Generated on Fri Jun 23 2017 23:26:20 GMT+0800 (CST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'context.js',
    	{
        	pattern : 'loadModule/**/*',
        	watched : false,
        	included : false,
        	served : true,
        	nocache : false
        }
    ],

    // webpack configuration
    webpack: {
        resolve: {
            alias: {
                src: path.resolve ( __dirname, '../../src' ),
                func: path.resolve ( __dirname, '../../src/func' ),
                core: path.resolve ( __dirname, '../../src/core' ),
                ice: path.resolve ( __dirname, '../../src/core/core' ),

            }
        },
        module: {
            rules: [
                { test: /\.js/, exclude: /node_modules/, loader: 'babel-loader', query: { presets: [ "es2015" ] } }
            ]
        },
        devtool: 'inline-source-map'
    },

    // saucelabs configuration
    sauceLabs: {
    	testName: "icejs cross browser test",
    	recordVideo: false,
    	recordScreenshots: false,
    	build: 'build-' + Date.now(),
    },
    customLaunchers: customLaunchers,
    captureTimeout: 300000,
    browserNoActivityTimeout: 300000,

    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'context.js': ['webpack', 'sourcemap']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'saucelabs'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    // autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Firefox'],
    // browsers: ['Safari'],
    browsers: Object.keys ( customLaunchers ),
    // browsers: ['IE'],
    // browsers: ['Chrome', 'Safari', 'Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // Proxy path
    proxies: {
    	'/plugin/' : '/base/loadModule/module-files/plugin/',
        '/module/' : '/base/loadModule/module-files/module/',
        '/component/' : '/base/loadModule/module-files/component/',
        '/post/' : '/base/loadModule/post/'
    }
  })
}