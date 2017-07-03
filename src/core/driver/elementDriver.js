"use strict";

/* 声明此文件在jshint检测时的变量不报 "variable" is not defined. */
/* globals util,
	
 */

/**
 * 渲染元素驱动器
 *
 * @author JOU
 * @time   2017-05-23T23:12:52+0800
 * @param  {Object/Array}           elems 	   元素驱动器单个对象或数组
 * @param  {String}                 driverExp  驱动器表达式
 */
function elementDriver ( elems, driverExp ) {

	var driver,

		// 待加载驱动器数据保存对象
		loading = {};

	// 统一为数组
	elems = util.type ( elems ) === "array" ? elems : [ elems ];

	util.foreach ( driverExp.split ( "," ), function ( driverName ) {
		driverName = util.trim ( driverName );
		driverName = config.params.alias [ driverName ] || driverName;

		// 查看驱动器是否已加载
		// 如果有alias则使用alias获取driver地址，否则直接使用driverName
		if ( driver = cache.componentFactory ( driverName, TYPE_DRIVER ) ) {

			// 渲染元素
			elementDriver.render ( elems, driver );
		}

		// 加载元素驱动器
		else {
			// http.get (  )
		}
	} )
}

//////////////////////////////////////////
// 元素驱动器相关属性通用参数，为避免重复定义，统一挂载到elementDriver对象上
//
util.extend ( elementDriver, {
	aDriver : "ice-driver",
	aParam 	: "ice-param"
} );


util.extend ( elementDriver, {

	/**
	 * 使用元素驱动器渲染元素组件
	 *
	 * @author JOU
	 * @time   2017-05-24T22:16:56+0800
	 * @param  {Array}                 elems  被渲染元素数组
	 * @param  {Object}                 driver 元素驱动器
	 */
	render 	: function ( elems, driver ) {
		util.foreach ( elems, function ( elem ) {
			driver.init.call ( elem );
		} );
	}
} );