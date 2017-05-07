'use strict';

/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* 
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported 
	driverLoader,

 */

'use strict';

/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals runtimeErr,
	util.type,
	util.foreach,
	util.isEmpty,
	crystals,
	push,
	splice,
	Promise,
	animation,
	language,
	util,
	http,
	event,
	cache,

	TYPE_PAGE,
	TYPE_MODULE,
	TYPE_PLUGIN,
	TYPE_DRIVER,
	PAGE_STATE: true,
	STATE_LOADING,
	STATE_PARSED,
	STATE_READY,
	PLUGIN_BUILTIN,
	PLUGIN_EXTERNAL,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported moduleInvoke,

 */

/**
 * 元素驱动器加载器类
 * ice解析页面时，当遇到没有缓存的元素驱动器则会异步加载此驱动器对象，并将待渲染元素对象与对应的元素驱动器保存在DriverLoader类的对象中，等到加载完成后再取出进行渲染
 *
 * @author JOU
 * @time   2017-05-06T00:48:00+0800
 * @param  {[type]}                 name [description]
 * @param  {[type]}                 load [description]
 */
function DriverLoader ( name, load ) {

	/** @type {Array} 等待加载完成的驱动器，每加载完成一个驱动器都会将此模块在waiting对象上移除，当waiting为空时则表示驱动器已全部加载完成 */
	this.waiting 	= [];
}

DriverLoader.prototype = {

	/** @type {Function} 将DriverLoader的构造器再指回本身 */
	constructor : DriverLoader,
	
};