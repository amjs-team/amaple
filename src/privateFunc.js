'use strict';

/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals replace,
	_forEach,
	push,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported urlTransform$,
	setCurrentPath$,
	getCurrentPath$,
	decomposeArray$,
*/

///////////////////////////////
///							///
///     内部调用，外部不可见    ///
///     内部函数末尾带$ 		///
///                         ///
///////////////////////////////


/**
 * 将url中的"/"和"."做调换，此方法用于设置请求路径与模块定义时的依赖注入。
 * 当mode不传或传入null、false时表示false，即字符串将.替换为/
 * 当mode有值时表示true，即字符串将/替换为.
 *
 * @author JOU
 * @time   2016-08-21T10:50:51+0800
 * @param  {String}                 str  被替换的字符串
 * @param  {Multi}                 	mode 替换模式，当mode有值时表示true，不传入或为null时表示false
 * @return {String}                      处理后的字符串
 */
function urlTransform$ ( str, mode ) {
	mode 					= mode ? true : false;

	var rpoint 				= /\./g,
		rsep 				= /\//g,
		point 				= '.',
		separation 			= '/';
		

	return mode ? replace.call(str, rsep, point) : replace.call(str, rpoint, separation);
}

/**
 * 设置module当前加载的路径，用于无刷新跳转时获取替换前的路径，以在后退或前进操作时找到上一个状态所对应的路径
 * 
 *
 * @author JOU
 * @time   2017-03-24T23:32:48+0800
 * @param  {Object}                 module 带有ice-module属性的标签对象
 * @param  {String}                 path   模块的当前路径
 */
function setCurrentPath$ ( module, path ) {
	module.currentPath = path;
}

/**
 * 获取module当前加载的路径，用于无刷新跳转时获取替换前的路径，以在后退或前进操作时找到上一个状态所对应的路径
 *
 * @author JOU
 * @time   2017-03-24T23:36:47+0800
 * @param  {Object}                 module 带有ice-module属性的标签对象
 * @return {String}                        模块的当前路径
 */
function getCurrentPath$ ( module ) {
	return module.currentPath || '';
}

/**
 * 将一个数组以相邻的两个值为一组分解出来并传入回调函数中
 * 此方法将不改变原数组
 * 当前一个值为空时则跳过
 *
 * @author JOU
 * @time   2017-03-27T23:11:58+0800
 * @param  {Array}                 array     分解的数组
 * @param  {Function}              callback  回调函数，函数中传入每次分解出来的两个值
 */
function decomposeArray$ ( array, callback ) {

	// 复制array的副本到_array中
	// 此地方直接使用“=”时只是引用，如果改变tmpArr也将改变原数组
	var _array = concat.call ( [], array ),

		_arr;

	if (_config.params.moduleSeparator === '/') {
		for ( var i = 0; i < _array.length; ) {
			if ( _array [ i ] !== '' ) {
				callback ( _array[ i ], _array[ i + 1] || '' );

				i += 2;
			}
			else {
				i ++;
			}
		}
	}
	else {
		_forEach ( _array, function ( arr ) {
			if ( arr !== '' ) {
				_arr = split.call ( arr, _config.params.moduleSeparator );
				callback ( _arr [ 0 ], _arr [ 1 ] );
			}
		} );
	}
}
