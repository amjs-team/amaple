const 
	customLaunchers = {
        ies: {
            sl_ie_9: {
                base: 'SauceLabs',
                browserName: 'internet explorer',
                platform: 'Windows 7',
                version: '9'
            },
            sl_ie_10: {
                base: 'SauceLabs',
                browserName: 'internet explorer',
                platform: 'Windows 8',
                version: '10'
            },
            sl_ie_11: {
                base: 'SauceLabs',
                browserName: 'internet explorer',
                platform: 'Windows 8.1',
                version: '11'
            },
            sl_edge_13: {
                base: 'SauceLabs',
                browserName: 'MicrosoftEdge',
                platform: 'Windows 10',
                version: '13'
            },
            sl_edge_15: {
                base: 'SauceLabs',
                browserName: 'MicrosoftEdge',
                platform: 'Windows 10',
                version: '15'
            },
        },
        firefoxs: {
            sl_firefox_7: {
                base: 'SauceLabs',
                browserName: 'Firefox',
                platform: 'Windows 7',
                version: '7'
            },
            sl_firefox_14: {
                base: 'SauceLabs',
                browserName: 'Firefox',
                platform: 'Windows 7',
                version: '14'
            },
            sl_firefox_25: {
                base: 'SauceLabs',
                browserName: 'Firefox',
                platform: 'Windows 7',
                version: '25'
            },
            sl_firefox_40: {
                base: 'SauceLabs',
                browserName: 'Firefox',
                platform: 'Windows 7',
                version: '40'
            },
            sl_firefox_56: {
                base: 'SauceLabs',
                browserName: 'Firefox',
                platform: 'Windows 7',
                version: '56'
            },
        },
        chromes: {
            sl_chrome_26: {
                base: 'SauceLabs',
                browserName: 'chrome',
                platform: 'Windows 7',
                version: '26'
            },
            sl_chrome_32: {
                base: 'SauceLabs',
                browserName: 'chrome',
                platform: 'Windows 7',
                version: '32.0'
            },
            sl_chrome_48: {
                base: 'SauceLabs',
                browserName: 'chrome',
                platform: 'Windows 7',
                version: '48.0'
            },
            sl_chrome_62: {
                base: 'SauceLabs',
                browserName: 'chrome',
                platform: 'Windows 7',
                version: '62.0'
            },
            sl_chrome_beta: {
                base: 'SauceLabs',
                browserName: 'chrome',
                platform: 'Windows 7',
                version: 'beta'
            },
        },
        safaris: {
            sl_safari_8: {
                base: 'SauceLabs',
                browserName: 'safari',
                platform: 'OS X 10.10',
                version: '8'
            },
            sl_safari_10: {
                base: 'SauceLabs',
                browserName: 'safari',
                platform: 'OS X 10.11',
                version: '10'
            },
        },
        mobiles: {
            sl_ios: {
                base: 'SauceLabs',
                browserName: 'iphone',
                version: '10.3'
            },
                sl_android: {
                base: 'SauceLabs',
                browserName: 'android',
                version: '6.0'
            }
        }
	},
	path = require ( 'path' );

let testLaunchers;
if ( process.argv [ 4 ] ) {
    testLaunchers = customLaunchers [ process.argv [ 4 ] ];
}
else {
    testLaunchers = {};
    for ( let i  in customLaunchers ) {
        for ( let j in customLaunchers [ i ] ) {
            testLaunchers [ j ] = customLaunchers [ i ] [ j ];
        }
    }
}


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
    	testName: "icejs test" + ( process.argv [ 4 ] ? " on " + process.argv [ 4 ] : "" ),
    	recordScreenshots: false,
        recordVideo: false,
    	build: 'build-' + Date.now(),
    },
    retryLimit: 10,
    customLaunchers: testLaunchers,
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
    reporters: ['dots', 'saucelabs'],


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
    browsers: Object.keys ( testLaunchers ),


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