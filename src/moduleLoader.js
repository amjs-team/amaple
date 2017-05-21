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
function ModuleLoader ( name, load ) {

	
	/** @type {Object} 需要加载的模块，加载完成所有模块需要遍历此对象上的所有模块并调用相应回调函数 */
	this.load 		= {};

	/** @type {Array} 等待加载完成的模块，每加载完成一个模块都会将此模块在waiting对象上移除，当waiting为空时则表示相关模块已全部加载完成 */
	this.waiting 	= [];


	//////////////////////////////////////////
	//////////////////////////////////////////
	this.load [ name ] = load;
}

ModuleLoader.prototype = {

	/** @type {Function} 将moduleLoader的构造器再指回本身 */
	constructor : ModuleLoader,


	/**
	 * 将等待加载完成的模块名放入context.waiting中
	 *
	 * @author JOU
	 * @time   2016-09-06T12:06:13+0800
	 * @param  {String}                 name 模块名
	 */
	putWaiting : function ( name ) {
		this.waiting.push ( name );
	},

	/**
	 * 将已加载完成的模块从等待列表中移除
	 *
	 * @author JOU
	 * @time   2017-05-05T23:09:40+0800
	 * @param  {String}                 name 模块名称
	 * @return {Number}                      剩余待加载模块数量
	 */
	dropWaiting : function ( name ) {
		var pointer = this.waiting.indexOf ( name );
		if ( pointer !== -1 ) {
			this.waiting.splice ( pointer, 1 );
		}

		return this.waiting.length;
	},

	/**
	 * 将加载的模块信息放入load对象中
	 *
	 * @author JOU
	 * @time   2017-05-07T12:01:06+0800
	 * @param  {String}                 name 模块名
	 * @param  {Object}                 load 模块信息
	 */
	putLoad : function ( name, load ) {
		this.load [ name ] = load;
	},

	/**
	 * 获取需要加载的模块对象
	 *
	 * @author JOU
	 * @time   2017-05-05T23:18:40+0800
	 * @param  {String}                 name 模块名
	 * @return {Object}                      模块对象
	 */
	getLoad : function ( name ) {
		return this.load [ name ];
	}
};

/** @type {String} 文件后缀 */
ModuleLoader.suffix 		= '.js';

/** @type {String} js插件的模块名称属性，通过此属性可以得到加载完成的模块名 */
ModuleLoader.moduleName 	= 'data-moduleName';

/** @type {String} script加载模块时用于标识模块 */
ModuleLoader.scriptFlag 	= 'module-loading';

/** @type {String} script加载模块时用于标识模块 */
ModuleLoader.loaderID 		= 'loader-ID';

/** @type {String} 顶层模块名 */
ModuleLoader.topModuleName 	= '*';

/** @type {Object} 保存正在使用的模块加载器对象，因为当同时更新多个模块时将会存在多个模块加载器对象 */
ModuleLoader.loaders 		= {};

/**
 * 创建ModuleLoader对象保存于ModuleLoader.loaders中
 * 
 *
 * @author JOU
 * @time   2017-05-05T22:43:12+0800
 * @param  {String}                 guid        全局唯一标示
 * @param  {String}                 name        模块名称
 * @param  {Object}                 loadModules 保存的模块对象
 * @return {Object}                             ModuleLoader实例
 */
ModuleLoader.create = function ( guid, name, loadModules ) {

	ModuleLoader.loaders [ guid ] = new ModuleLoader ( name, loadModules );
	return ModuleLoader.loaders [ guid ];
};

/**
 * 获取当前正在执行的模块名与对应的模块加载器编号
 * 此方法使用报错的方式获取错误所在路径，使用正则表达式解析出对应模块信息
 *
 * @author JOU
 * @time   2017-05-07T11:55:31+0800
 * @return {Object}                 模块信息
 */
ModuleLoader.getCurrentModule = function () {
	try {
		____a.____b();
	} catch(e) {
		if ( e.stack ) {
			var match = /\?m=(\S+)&guid=([\d]+):?/.exec ( e.stack );
			return {
				name: match [ 1 ],
				guid: match [ 2 ]
			};
		}
	}
};

/**
 * 插件注入方法实现，此方法默认注入的第一个参数是crystals对象，deps数组中的对象从第二个参数开始注入
 * 此方法先查找顺序为内置插件、外部插件、动态加载插件并缓存于外部插件
 *
 * @author JOU
 * @time   2016-09-06T14:13:38+0800
 * @param  {Object}                 module 注入模块
 * @return {Multi}                         注入后模块
 */
ModuleLoader.inject = function ( module, loader ) {
	var args = [ crystals ],
		arg, ret;

	util.foreach ( module.deps, function ( dep ) {

		// 查找插件
		if ( arg = cache.componentFactory ( dep, TYPE_PLUGIN ) ) {
			args.push ( arg );
		}

		// 如果都没找到则去此此加载完成的模块中获取并缓存入外部对象
		else {
			arg = ModuleLoader.inject ( loader.getLoad ( dep ), loader );
			cache.componentCreater ( dep, arg, PLUGIN_EXTERNAL );

			args.push ( arg );
		}
	} );

	// 根据模块类型进行不同的操作
	// 当模块类型为page或module时将依赖模块注入factory方法内返回，因为需要根据当前的页面状态值来判断是否需要马上执行factory方法；
	// 当模块类型为plugin时注入依赖项并立即执行factory方法获取plugin对象
	if ( module.type === TYPE_PAGE || module.type === TYPE_MODULE ) {
		ret = function () {
			module.factory.apply ( null, args );
		};
	}
	else if ( module.type === TYPE_PLUGIN ) {
		ret = module.factory.apply ( null, args );
	}
	else if ( module.type === TYPE_DRIVER ) {
		// 后续添上
	}

	return ret;
};

/**
 * 模块工厂方法调用控制，只调用ice.page和ice.module的工厂方法调用。只有当页面状态正确时才会调用，否则将会存储起来等待调用
 *
 * @author JOU
 * @time   2016-09-11T01:42:39+0800
 * @param  {Function}                 factory 待执行的工厂方法
 * @param  {type}                 	  type    模块类型
 */
ModuleLoader.factoryInvoke = function ( factory, type ) {

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
};

/**
 * js依赖模块onload事件回调函数
 * ps:此函数不是直接在其他地方调用，而是赋值给script的onload事件的，所以函数里的this都需要使用moduleLoader来替代
 *
 * @author JOU
 * @time   2016-09-05T15:44:48+0800
 * @param  {Object}                 event event对象
 */
ModuleLoader.onScriptLoaded = function ( event ) {

	var loadID 		= event.target.getAttribute ( ModuleLoader.loaderID ),
		curLoader 	= ModuleLoader.loaders [ loadID ];

	// 执行
	if ( curLoader.dropWaiting ( event.target.getAttribute(ModuleLoader.moduleName ) ) === 0 ) {

		/** @type {Function} 依赖注入后的工厂方法 */
		var factory = ModuleLoader.inject ( curLoader.getLoad ( ModuleLoader.topModuleName ), curLoader );

		// 调用工厂方法
		ModuleLoader.factoryInvoke ( factory, curLoader.getLoad ( ModuleLoader.topModuleName ).type );
		
		delete ModuleLoader.loaders [ loadID ];
	}
};