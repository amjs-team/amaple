'use strict';

/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals util,
	configErr,
	ice,
	document,
	PAGE_STATE: true,
	STATE_CONFIGED,
	event,
	
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* 
 */

/** @type {Array} 目前所支持的状态标记符号，如果所传入的状态标记符号不在此列表中，则会使用默认的状态标记符号@ */
var stateValue 	= [ '@', '$', '^', '*', '|', ':', '~', '!' ];


/**
 * 对开发者传入的配置参数进行初始化操作，并获取crystals对象供开发者进行调用。传入的参数将会与默认参数合并，当开发者没有设置的一些配置项将会使用默认的参数
 * 参数格式：
 *  {
		stateMark: '...', 		状态标识符，默认为"@"
		base: { 	    	    对象，内包含url、lang、plugin、driver参数
			url: '...',			请求base路径
			lang: '...',		语言包根目录，当此值为function时需返回一个路径字符串
			plugin: '...', 		插件根目录，当此值为function时需返回一个路径字符串
			driver: '...' 		驱动器根目录，当此值为function时需返回一个路径字符串
		},
		redirectCache, '...'	模块跳转缓存，当加载过的模块再次跳转时则使用缓存而不再请求服务器，适用于实时性差的模块,默认为true
	}
 *
 * @author JOU
 * @time   2016-07-25T16:33:26+0800
 * @param  {Object}                 	params 开发者传入的配置参数对象
 */
function config ( params ) {
	// 配置参数的类型固定为object
	if ( util.type ( params ) !== 'object' ) {
		throw configErr ( 'params', '配置参数为参数对象' );
	}

	/** @type {String} 用于临时存储参数的类型 */
	var type,

		/** @type {Object} 默认配置参数 */
		_params 	= {
		/** @type {Object} 异步加载时的依赖目录，设置后默认在此目录下查找，此对象下有4个依赖目录的设置，如果不设置则表示不依赖任何目录 */
		base 			: {
			/** 
			 * url请求依赖目录，影响crystals.path方法中的路径设置，如果此参数已设置，则crystals.path方法内设置的路径都是基于此依赖目录来请求的
			 * 
			 * ps：此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
			 * @type {String/Function}
			 */
			url 			: '',

			/** 
			 * 插件加载的依赖目录，影响ice.page\ice.module\plugin方法加载插件时的路径设置，如果此参数已设置，则加载插件的路径都是基于此依赖目录来加载的
			 * 
			 * ps：此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
			 * @type {String/Function}
			 */
			plugin 			: '',

			/** 
			 * 元素驱动器的加载依赖目录，影响driver方法加载驱动器时的路径设置，如果此参数已设置，则加载驱动器的路径都是基于此依赖目录加载
			 * 
			 * ps：此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
			 * @type {String/Function}
			 */
			driver 			: '',

			/** 
			 * 语言包依赖目录，影响language内置插件的路径设置，如果此参数已设置，则language内置插件的路径都是基于此依赖目录来请求的文件的
			 * 
			 * ps：此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
			 * @type {String/Function}
			 */
			lang 			: ''
		},

		/** @type {String} url地址中的状态标识符，如http://...@login表示当前页面在login的状态 */
		stateMark		: stateValue [ 0 ],

		/** @type {Boolean} 是否开启跳转缓存，默认开启。跳转缓存是当页面无刷新跳转时缓存跳转数据，当此页面实时性较低时建议开启，以提高相应速度 */
		redirectCache 	: true,

		/** @type {String} 状态码键名，此状态码为服务器返回的数据中用于标识数据状态，客户端根据此状态码作出不同的处理。默认为"code" */
		codeKey 		: 'code',

		/** @type {String} 自定义html模块键名，此html模块为服务器返回的数据中用于标识请求的html内容，客户端将此内容填充进对应模块中。默认为"html" */
		htmlKey 		: 'html',

		/** @type {String} url中模块名称与模块内容标识的分隔符，默认为"-" */
		moduleSeparator : '-',

		/** @type {String} 自定义ajax请求时的url规则，通过设置此规则将规则中的模块名称与模块内容标识替换为当前请求环境的真实值，此规则与base.url和ice-base关联，即当设置了base.url且ice-base不为false时将自动添加base.url到此url前，如果ice-base为false时，此规则转换后的url将会从根目录当做url的起始路径，即在设置规则时第一个字符如果不是"/"，则系统将自动添加"/"到url的开头部分。默认规则为":m/:v.html" */
		urlRule 		: ':m/:v.html',

		/** @type {Array} 二维数组，无刷新跳转时，不同请求路径对应的标题，格式为{path1: title1, path2: title2...}。path可以是任何字符，但必须使用引号引起，title为字符串或方法（当为方法时接收一个codeKey参数，方法需返回一个字符串作为标题，如返回为空则标题将不变） */
		header 			: {}
	};

	if ( !util.isEmpty(params ) ) {
		// 处理params.base内参数
		if ( params.base !== undefined ) {
			// 处理params.base.url参数
			if ( params.base.url !== undefined ) {
				type 				= util.type ( params.base.url );
				params.base.url = type === 'string' ? params.base.url : 
									  type === 'function' ? params.base.url() :
									  '';
				params.base.url = params.base.url.substr ( -1, 1 ) === '/' ? params.base.url : params.base.url + '/';
			}

			// 处理params.base.plugin参数
			if ( params.base.plugin !== undefined ) {
				type 			= util.type ( params.base.plugin );
				params.base.plugin = type === 'string' ? params.base.plugin : 
									  type === 'function' ? params.base.plugin() :
									  '';
				params.base.plugin = params.base.plugin.substr ( -1, 1 ) === '/' ? params.base.plugin : params.base.plugin + '/';
			}

			// 处理params.base.driver参数
			if ( params.base.driver !== undefined ) {
				type 		= util.type ( params.base.driver );
				params.base.driver = type === 'string' ? params.base.driver : 
									 type === 'function' ? params.base.driver() :
									 '';
				params.base.driver = params.base.driver.substr ( -1, 1 ) === '/' ? params.base.driver : params.base.driver + '/';
			}
		}

		// 处理params.base.lang参数
		if ( params.base !== undefined && params.base.lang !== undefined ) {
			type 			= util.type ( params.base.lang );
			params.base.lang = type === 'string' ? params.base.lang : 
								  type === 'function' ? params.base.lang() :
								  '';

			params.base.lang = params.base.lang.substr(-1, 1) === '/' ? params.base.lang : params.base.lang + '/';
		}

		// 判断传入的stateMark是否在stateValue限定的状态标记符号内
		params.stateMark = stateValue.indexOf ( params.stateMark ) === -1 ? stateValue [ 0 ] : params.stateMark;

		// 判断传入的redirectCache是否为true或false
		params.redirectCache = params.redirectCache !== false ? true : false;
	}
	
	params.base = util.extend ( _params.base, params.base );
	util.extend ( config, { params: util.extend ( _params, params ) } );
}

// ice对象继承config方法
util.extend ( ice, {
	config : config
} );

// 异步加载用户配置文件
( function () {
	//////////////////////////////////////////
	// 根据icejs的script标签上的config属性来调用js文件，如没有该属性则传入空配置参数初始化配置
	// 
	var configSrc;

	if ( configSrc = util.s ( 'script[config]' ).getAttribute( 'config' ) ) {

		var script = document.createElement('script');
		script.src = configSrc;

		util.appendScript(script, function () {
			PAGE_STATE = STATE_CONFIGED;

			event.emit ( 'parsed' );
		} );
	}
	else {
		config( {} );

		PAGE_STATE = STATE_CONFIGED;
	}
	//////////////////////////////////////////
	//
	//
} )();