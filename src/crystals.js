'use strict';

/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals util,
	
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported crystals,

 */

/**
 * 贯穿整个框架的对象。crystals提供了外部环境与ice内部环境的交互的接口，开发者可在此对象上设置一些参数来供内部查找调用，同时也提供内部封装属性给开发者进行调用
 *
 * @author JOU
 * @time   2017-05-07T21:38:45+0800
 * @param  {String}  	selector 元素选择器
 * @return {Object}              返回元素驱动器对象
 */
function crystals ( selector ) {

}

/* 	src			请求路径（如果config配置了base参数，则跳转请求路径为base/src.js）
	moduleName	跳转的模块名，当module值为对象时，表示返回的不同状态对应跳转不同的模块
	data 		提交的额外参数，可写格式为k1=v1&k2=v2，或{k1:v1, k2:v2}
	timeout		请求超时时间，超过时间后中断请求，单位为ms
	before		发送请求前的回调函数，回调函数参数为xhr、fragment
	success		返回成功后的执行回调函数，回调函数参数为newFragment、oldFragment
	error 		请求错误时的回调函数，回调参数为error
	abort 		请求中断后的执行回调函数

	单个模块简单更新时
	src, moduleName, data, callback

	单个模块复杂更新时
	{
		src: src,
		moduleName: moduleName,
		data: data
		timeout: timeout,
		before: before,
		success: success,
		error: error,
		abort: abort,
	}

	多个模块复杂更新时
	{
		module: {
			src: src,
			moduleName: moduleName,
			data: data
		},
		timeout: timeout,
		before: before,
		success: success,
		error: error,
		abort: abort,
	}
*/

util.extend ( crystals, {
	refreshModule : function ( src, moduleName, data, callback ) {
		if ( util.type ( src ) === 'object' ) {
			if ( arguments.length === 1 ) {

			}
		}
	},

	submit : function ( src, moduleName, data, callback ) {
		
	}
} );