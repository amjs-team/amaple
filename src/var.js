'use strict';

/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals iceError,
	window,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported argErr,
	requestErr,
	configErr,
	runtimeErr,
	moduleErr,

	rtype,
	xhr,
	join,
	concat,
	forEach,
	toUpperCase,
	toLowerCase,
	split,
	substr,
	replace,
	hasOwnProperty,
	isPrototypeOf,
	_defaultOptions,
	slice,
	splice,
	push,
	toString,
	ice,
	plugin,
	driver,
	msie,
	msXhrDialect,
	moduleQueue,
	
	STATE_PARSED,
	STATE_READY,
	PAGE_STATE,
	TYPE_PAGE,
	TYPE_MODULE,
	TYPE_PLUGIN,
	TYPE_DRIVER,
	PLUGIN_BUILTIN,
	PLUGIN_EXTERNAL
 */

// 错误类型创建
	/** @type {Function} 环境错误 */
var envErr 					= iceError ( 'env' ),

	/** @type {Function} 参数错误 */
	argErr 					= iceError ( 'arg' ),

	/** @type {Function} 请求错误 */
	requestErr 				= iceError ( 'request' ),

	/** @type {Function} 配置错误 */
	configErr 				= iceError ( 'config' ),

	/** @type {Function} 运行时错误 */
	runtimeErr 				= iceError ( 'runtime' ),

	/** @type {Function} 模块错误 */
	moduleErr 				= iceError ( 'module' );



/** icejs只能运行在浏览器环境，如果当前环境没有window或document，则不再往下执行 */
if ( typeof window === 'undefined' || typeof window.document !== 'object' ) {
	throw envErr ( 'browser', 'ice只能在浏览器环境中运行...' );
}

//////////////////////////////////////////
// 函数定义区
var a 	 					= [],
	s 	 					= '',
    slice 					= a.slice,
    splice 					= a.splice,
    push 					= a.push,
    join 					= a.join,
    concat  				= a.concat,

    toUpperCase 			= s.toUpperCase,
    toLowerCase 			= s.toLowerCase,
    split 					= s.split,
    substr 					= s.substr,
    replace 				= s.replace,

    toString 				= Object.prototype.toString,
    hasOwnProperty 			= Object.prototype.hasOwnProperty,
    isPrototypeOf 			= Object.prototype.isPrototypeOf,
    // END 函数定义区 
    //////////////////////////////////////////
    //
    //
    //////////////////////////////////////////
	// 变量定义区
	document 				= window.document,

    /** @type {Object} ice对象 */
	ice 					= window.ice || ( window.ice = {} ),

	
    

	/** @type {Object} 浏览器的类型、版本及当前平台类型 */
	browser 					= ( function ( ua ) {

									var match 		= /(chrome)[ \/]([\w.]+)/.exec ( ua ) || /(webkit)[ \/]([\w.]+)/.exec ( ua ) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec ( ua ) || /(msie) ([\w.]+)/.exec ( ua ) || ua.indexOf( "compatible" ) < 0 && /(mozilla)(?:.* rv:([\w.]+)|)/.exec ( ua ) || [],

										platform 	= /(mac)/.exec ( ua ) || /(windows)/.exec ( ua ) || /(ipad)/.exec ( ua ) || /(iphone)/.exec ( ua ) || /(android)/.exec ( ua ) || [],

										ret 		= {};


									ret [ match[ 1 ] || '' ] = true;
									ret.version 			 = match [ 2 ]    || '0';
									ret.platform 			 = platform [ 0 ] || '';

									return ret;
										
								  } )( window.navigator.userAgent.toLowerCase () );
// END 变量定义区 
//////////////////////////////////////////


//////////////////////////////////////////
// 常量定义区
// 
// 当前页面状态值
// 状态值的顺序为STATE_LOADING、STATE_CONFIGED、STATE_PARSED、STATE_READY
// 页面初始状态为STATE_LOADING，此时将加载用户的配置文件并将状态改变为STATE_CONFIGED，如果没有配置文件则直接改变状态为STATE_CONFIGED
// 当前状态为STATE_CONFIGED时执行初始化操作，初始化完成后将状态改变为STATE_PARSED
// 当前状态为STATE_CONFIGED时执行ice.page()，ice.page()执行完成后将状态改变为STATE_READY
// 
/** @type {Number} STATE_LOADING表示未解析当前页面元素且未执行ice.page() */
var STATE_LOADING 			= 0,
	
	/** @type {Number} STATE_CONFIGED表示配置已加载完成但还未解析当前页面 */
	STATE_CONFIGED 			= 1,

	/** @type {Number} STATE_PARSED表示解析完成当前页面元素但未执行ice.page() */
	STATE_PARSED 			= 2,

	/** @type {Number} STATE_PARSED表示解析完成当前页面元素且执行完成ice.page() */
	STATE_READY 			= 3,


	/**
	 * 当前页面状态，表示未解析当前页面元素、解析完成当前页面元素、执行完成ice.page()【ice.page() @see core.js】，具体状态值@see STATE_LOADING\STATE_PARSED\STATE_READY
	 * 
	 * warning:解析页面元素与ice.page()方法的执行顺序不可逆
	 * @type {Number} 
	 */
	PAGE_STATE 				= STATE_LOADING,

	
	/** 模块类型 */
	/** @type {Number} 表示ice.page() */
 	TYPE_PAGE 				= 1,

 	/** @type {Number} 表示ice.module() */
	TYPE_MODULE 			= 2,

	/** @type {Number} 表示plugin() */
	TYPE_PLUGIN 			= 3,

	/** @type {Number} 表示driver() */
	TYPE_DRIVER 			= 4,

	/**
	 * 插件类型
	 */
	/** @type {String} 内部插件 */
	PLUGIN_BUILTIN 			= 'BUILT_IN',
	
	/** @type {String} 外部插件 */
	PLUGIN_EXTERNAL 		= 'EXTERNAL';

	// END 常量定义区 
	//////////////////////////////////////////
	//
	//
	//