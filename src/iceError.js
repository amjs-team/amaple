'use strict';

/* 声明此文件在jshint检测时的变量不报 variable is defined but never used */
/* exported iceError */

/**
 * 错误类型生成器，你可以使用此函数生成一个特定类型的错误生成器，在抛出错误异常时使用特定生成的错误生成器抛出特定的错误类型
 * eg:
 * var exampleErr = iceError('example');
 * exampleErr('code', '这是一个示例错误');
 *
 * console:
 * [example:code]这是一个示例错误
 *
 * 如果没有传入moduleName或moduleName为空，则在使用此错误生成器时在中括号内不会显示模块名称，而是直接显示错误的code，紧接着跟错误内容。
 *
 * @author JOU
 * @time   2016-07-19T12:34:35+0800
 * @param  {string}                 moduleName 模块名称
 */
function iceError(moduleName) {
	return function (errCode, err) {
		//
		// 打印的错误信息
		//
		var errMsg = '[ice:' + (moduleName ? moduleName + '-' : '') + errCode + '] ' + err;
		return new Error(errMsg);
	}
}