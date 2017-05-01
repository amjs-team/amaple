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

/** @type {Object} 模块加载器，使用ice.page()或ice.module()依赖注入插件时将在此对象上进行查找插件并注入，如注入插件未加载则加载完成后保存于此，以防止重复加载
	插件分为内置插件与外部插件，内置插件可直接使用插件名注入；
	外部插件则需使用插件相对于_config.base的路径注入(可省略.js)。
 */
var moduleLoader 			= {
	/** @type {String} 文件后缀 */
	suffix					: '.js',

	/** @type {String} js插件的模块名称属性，通过此属性可以得到加载完成的模块名 */
	moduleName 				: 'data-moduleName',

	/** @type {String} 顶层模块名 */
	topModuleName 			: '*',

	/** @type {Object} 模块加载容器，用于模块加载时的控制 */
	context 				: {
		/** @type {Object} 需要加载的模块，加载完成所有模块需要遍历此对象上的所有模块并调用相应回调函数 */
		loadModules 			: {},
		/** @type {Array} 等待加载完成的模块，每加载完成一个模块都会将此模块在waiting对象上移除，当waiting为空时则表示相关模块已全部加载完成 */
		waiting 				: [],
		/** @type {Object} 正在加载中的模块信息，此对象用于当前正在加载中的模块内获取模块名称，此对象将会在_module方法内被赋值 */
		loadingModules 			: {
			/** @type {Number} 当前模块名指针 */
			pointer 		 		: 0,
			/** @type {Array} 正在加载中的模块名数组 */
			names 					: []
		}
	},


	/**
	 * 模块加载器初始化
	 *
	 * @author JOU
	 * @time   2016-09-04T15:45:01+0800
	 */
	init: function () {
		// 初始化context对象
		this.context.loadModules 				= {};
		this.context.waiting 					= [];
		this.context.loadingModules.pointer 	= 0;
		this.context.loadingModules.names 		= [];
	},

	/**
	 * 将模块对象放入context.loadModules对象中，等到所有的模块都加载完成后则会在this.onScriptLoaded方法内依次使用此对象内的内容
	 *
	 * @author JOU
	 * @time   2016-09-06T12:11:35+0800
	 * @param  {String}                 name   保存的模块名
	 * @param  {Object}                 module 保存的模块对象
	 */
	putLoadModules: function ( name, module ) {
		this.context.loadModules [ name ] = module;
	},

	/**
	 * 将等待加载完成的模块名放入context.waiting中
	 *
	 * @author JOU
	 * @time   2016-09-06T12:06:13+0800
	 * @param  {String}                 name 模块名
	 */
	putWaitingModuleName: function ( name ) {
		if ( util.type ( this.context.waiting ) === 'array' ) {
			this.context.waiting.push ( name );
		}
	},

	/**
	 * 将正在加载中的模块名放入context.loadingModules.names中
	 *
	 * @author JOU
	 * @time   2016-09-06T12:02:25+0800
	 * @param  {String}                 name 模块名
	 */
	putLoadingModuleName: function ( name ) {
		if ( util.type ( this.context.loadingModules.names ) === 'array' ) {
			this.context.loadingModules.names.push ( name );
		}
	},

	/**
	 * 获取正在加载中的模块名
	 *
	 * @author JOU
	 * @time   2016-09-06T11:51:30+0800
	 * @return {String}                 模块名
	 */
	getLoadingModuleName: function () {
		return ( !util.isEmpty ( this.context.loadingModules.names ) && this.context.loadingModules.pointer >= 0 ) ? this.context.loadingModules.names [ this.context.loadingModules.pointer++ ] : false;
	},

	/**
	 * 插件注入方法实现，此方法默认注入的第一个参数是crystals对象，deps数组中的对象从第二个参数开始注入
	 * 此方法先查找顺序为内置插件、外部插件、动态加载插件并缓存于外部插件
	 *
	 * @author JOU
	 * @time   2016-09-06T14:13:38+0800
	 * @param  {[type]}                 module [description]
	 * @return {[type]}                        [description]
	 */
	inject: function ( module ) {
		var args 			= [ crystals ],
			_this 			= moduleLoader,

			depModule,
			returnValue;


		if (util.type ( module.deps ) === 'array') {
			util.foreach ( module.deps, function ( dep ) {
				// 查找插件
				if ( depModule = cache.componentFactory ( dep, TYPE_PLUGIN ) ) {
					args.push ( depModule );
				}

				// 如果都没找到则去此此加载完成的模块中获取并缓存入外部对象
				else {
					depModule = _this.inject ( _this.context.loadModules [ dep ] );
					cache.componentCreater (
						dep, 
						depModule, 
						PLUGIN_EXTERNAL
					);

					args.push ( depModule );
				}
			} );
		}

		// 根据模块类型进行不同的操作
		// 当模块类型为page或module时将依赖模块注入factory方法内返回，因为需要根据当前的页面状态值来判断是否需要马上执行factory方法；
		// 当模块类型为plugin时注入依赖项并立即执行factory方法获取plugin对象
		if ( module.type === TYPE_PAGE || module.type === TYPE_MODULE ) {
			returnValue = function () {
				module.factory.apply ( null, args );
			};
		}
		else if ( module.type === TYPE_PLUGIN ) {
			returnValue = module.factory.apply ( null, args );
		}
		else if ( module.type === TYPE_DRIVER ) {
			// 后续添上
		}

		return returnValue;
	},

	/**
	 * js依赖模块onload事件回调函数
	 * ps:此函数不是直接在其他地方调用，而是赋值给script的onload事件的，所以函数里的this都需要使用moduleLoader来替代
	 *
	 * @author JOU
	 * @time   2016-09-05T15:44:48+0800
	 * @param  {Object}                 event event对象
	 */
	onScriptLoaded : function ( event ) {

		/** @type {Function} 依赖注入后的工厂方法 */
		var 
			factory,

			_this 	= moduleLoader,
			pointer = _this.context.waiting.indexOf ( event.target.getAttribute(_this.moduleName ) );



		// 移除已加载完成的模块
		if ( pointer !== -1 ) {
			_this.context.waiting. splice ( pointer, 1 );
		}

		// 执行
		if ( _this.context.waiting.length === 0 ) {
			factory = _this.inject ( _this.context.loadModules [ _this.topModuleName ] );

			// 调用工厂方法
			_this.factoryInvoke ( factory, _this.context.loadModules [ _this.topModuleName ].type );
		}
	}, 

	/**
	 * 模块工厂方法调用控制，只调用ice.page和ice.module的工厂方法调用。只有当页面状态正确时才会调用，否则将会存储起来等待调用
	 *
	 * @author JOU
	 * @time   2016-09-11T01:42:39+0800
	 * @param  {Function}                 factory 待执行的工厂方法
	 * @param  {type}                 	  type    模块类型
	 */
	factoryInvoke : function ( factory, type ) {
		// 通过ice.PAGE_STATE 判断页面是否初始化是否完成，如未完成则存入模块数组等待执行，如完成则直接执行
		// 当module调用者为ice.page时
		if ( type === TYPE_PAGE ) {
			if ( PAGE_STATE === STATE_LOADING ) {

				// 当前页面还未解析完成时，将page传入的主函数存储起来等待执行（将会在当前页面解析完成后执行此函数）
				cache.setPageFactory ( factory );
				
			}
			else if ( PAGE_STATE === STATE_PARSED ) {
				factory && factory(); // jshint ignore:line

				// 将初始化状态设置为准备状态且执行完成ice.page
				PAGE_STATE = STATE_READY;

				// 执行缓存的module
				cache.queueInvoke ();
			}
			else {
				throw runtimeErr ( 'error', '页面状态错误(page)' );
			}
		}
		// 当module调用者为ice.module时
		else if ( type === TYPE_MODULE ) {
			if ( PAGE_STATE === STATE_PARSED ) {
				cache.addUnexecutedModule ( factory );
			}
			else if ( PAGE_STATE === STATE_READY ) {
				factory && factory (); // jshint ignore:line
			}
			else {
				throw runtimeErr ( 'error', '页面状态错误(module)' );
			}
		}
	}
};

cache.componentCreater ( {
	event 					: event,
	Promise 				: Promise,
	animation 				: animation,
	language 				: language,
	util					: util,
	http 					: http
}, PLUGIN_BUILTIN );