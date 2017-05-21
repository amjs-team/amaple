/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Icce.js                                                         *
 * Version: 0.1.0                                                  *
 * Site: http://icejs.org                                          *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * The states like ice                                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * @describe
 * 
 * gulp config file
 *
 * @author   JOU丶San <huzhen555@qq.com>
 * @time     2016-07-18 15:02:01
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

'use strict';

var gulp 	  	  = require('gulp');
var url 		  = require('url');

var loadPlugins   = require('gulp-load-plugins');
var $  		  	  = loadPlugins();

var pkg 		  = require('./package.json');

var path 		  = {
						srcAllJs 		: './src/**/*.js',
						distAllJs		: './dist/**/*.js',
						dist     		: './dist',
						test 			: './test',
						gulpFile 		: './gulpfile.js',
						files 			: require('./iceFiles.js'),
						concatPrefix	: './src/ice.prefix.js',
						concatSuffix	: './src/ice.suffix.js'
					};

// 模拟API请求数据
var mockData 	  = {
	'/api_json' : '{"a": 1, "b": 2}',
	'/api_text'	: '<link rel="stylesheet" type="text/css" href="a.css">',
	'/api_script' : 'console.log("request script success")',
	'/api_jsonp' : 'jsonpCallback8({aa: 1, bb: 2})',
};

/**
 * js语法检查
 *
 * @Author   JOU
 * @DateTime 2016-07-18T15:33:50+0800
 * @return   {[type]}                   stream
 */
gulp.task('hint', function() {
	return gulp.src(path.files.all)
	.pipe($.jshint())	
	.pipe($.jshint.reporter('default'));
});

/**
 * 检查gulpfile.js语法任务
 *
 * @author JOU
 * @time   2016-07-19T16:06:59+0800
 * @return {[type]}                   stream
 */
gulp.task('gulp:hint', function() {
	return gulp.src(path.gulpFile)
	.pipe($.jshint())	
	.pipe($.jshint.reporter('default'));
});

/**
 * 自动清除制定目录
 *
 * @Author   JOU
 * @DateTime 2016-07-18T16:23:39+0800
 * @return   {[type]}                   stream
 */
gulp.task('clean', function() {
	return gulp.src([path.distAllJs])
	.pipe($.clean());
});

/**
 * 合并src下所有的js文件到dist文件夹下
 *
 * @Author   JOU
 * @DateTime 2016-07-18T16:55:44+0800
 * @return   {[type]}                   stream
 */
gulp.task('concatjs', function() {
	return gulp.src(path.files.getMergeFiles())
	.pipe($.concat('ice.' + pkg.version + '.js'))
	.pipe(gulp.dest(path.dist));
});

gulp.task('connect', function() {
	return gulp.src([path.test, path.dist])
	.pipe($.webserver({
		open: true,
		// path: '/container/mod2/status/mod1',
		livereload: true,
		port: 8080,
		middleware: function(req, res, next) {
			var urlObj = url.parse(req.url, true),  
				method = req.method;


			for (var i in mockData) {
				if (i === urlObj.pathname) {
					res.end(mockData[i]);
					return;
				}
			}
			next();
		}
	}));
});

/**
 * 启动监视相应的目录，文件有变化则自动执行任务
 *
 * @Author   JOU
 * @DateTime 2016-07-18T17:27:06+0800
 */
gulp.task('watch', function() {
	$.livereload.listen();
	gulp.watch(path.gulpFile, ['gulp:hint', 'build']);
	gulp.watch(path.srcAllJs, ['hint', 'build']);
});

/**
 * 项目自动化构建全过程，按顺序有js语法检查、合并、重命名、压缩
 *
 * @Author   JOU
 * @DateTime 2016-07-18T17:27:45+0800	
 * @return   {[type]}                   stream
 */
gulp.task('build', function() {
	var allIce = path.files.getMergeFiles();
	return gulp.src(allIce)
	.pipe($.replace(/'use strict';/, ''))
	.pipe($.concat('ice.' + pkg.version + '.js', {newLine: '\n'}))
	.pipe($.replace(/\/\*\* mode:\s*strict \*\//, '\'use strict\';'))
	.pipe(gulp.dest(path.dist))
	.pipe($.rename('ice.' + pkg.version + '.min.js'))
	.pipe($.uglify())
	.pipe($.header('/*\n' +
					' ice V<%= version %>\n' +
					' @author:JOU<huzhen555@qq.com>\n' +
					' License:MIT\n' +
					'*/\n', {version: pkg.version}))
	.pipe(gulp.dest(path.dist))
	.pipe($.livereload());
});

gulp.task('default', ['hint', 'build', 'connect', 'watch']);