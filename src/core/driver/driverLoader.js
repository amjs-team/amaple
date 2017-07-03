"use strict";

/* 声明此文件在jshint检测时的变量不报 "variable" is not defined. */
/* 
 */

/* 声明此文件在jshint检测时的变量不报 "variable" is defined but never used */
/* exported 
	driverLoader,

 */

"use strict";

/* 声明此文件在jshint检测时的变量不报 "variable" is not defined. */
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

/* 声明此文件在jshint检测时的变量不报 "variable" is defined but never used */
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
function DriverLoader () {

	/** @type {Object} 等待加载完成的驱动器，每加载完成一个驱动器都会将此模块在waiting对象上移除，当waiting为空时则表示驱动器已全部加载完成 */
	this.waiting 	= {};

	this.count 		= 0;
}

util.extend ( DriverLoader.prototype, {

	/**
	 * 保存等待加载完成的元素驱动器及待渲染元素
	 * 如果遇到相同元素驱动器，则将待渲染元素push进已有元素驱动器对应的数组中
	 *
	 * @author JOU
	 * @time   2017-05-24T23:04:19+0800
	 * @param  {Object}                 obj 待加载完成的元素驱动器名称及待渲染元素
	 */
	// { "btn" : [a, b, c] }
	// [a, d, e]

	putWaiting : function ( obj ) {

		util.foreach ( obj, function ( elems, driverName ) {
			this.waiting [ driverName ] = this.waiting [ driverName ] = util.extend ( this.waiting [ driverName ] || [], elems );
			this.count ++;
		} );
	},

	/**
	 * 获取正在加载的元素驱动器数量
	 *
	 * @author JOU
	 * @time   2017-05-24T23:38:32+0800
	 * @return {Number}                 正在加载的元素驱动器数量
	 */
	getCount : function () {
		return this.count;
	}
} );


util.extend ( DriverLoader, {

	/** @type {String} 文件后缀 */
	suffix 			: ".js",

	/** @type {Object} 保存正在使用的驱动器加载器对象，因为当同时更新多个模块时将会存在多个驱动器加载器对象 */
	loaders : {},

	/**
	 * 创建DriverLoader对象保存于DriverLoader.loaders中
	 * 
	 *
	 * @author JOU
	 * @time   2017-05-24T23:41:54+0800
	 * @return {Object}                             DriverLoader对象与标识ID组成的对象
	 */
	create : function () {

		var guid 		= guid$ (),
			instance 	= DriverLoader.loaders [ guid ] = new DriverLoader ();

		return {
			id 			: guid,
			instance 	: instance
		};
	},
} );