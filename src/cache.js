'use strict';

/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals moduleErr,
	util,
	push,
	
	TYPE_PLUGIN,
	TYPE_DRIVER,
	PLUGIN_BUILTIN,
	PLUGIN_EXTERNAL,
	PAGE_STATE,
	STATE_PARSED,
	STATE_READY,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported cache,
	
 */

/** @type {Object} 内部缓存对象
 * 缓存内容如下：
 * 1. 插件对象缓存
 * 2. 元素驱动器缓存
 * 3. 页面跳转与状态切换时的缓存，开启缓存后，页面跳转数据将会被缓存，再次调用相同地址时将使用缓存更新页面以提高响应速度，实时性较高的页面建议关闭缓存。
 * 4. 当前页面初始化未完成时将page()模块的工厂方法缓存于page中，ice.page()未调用时，将ice.module()内定义的方法缓存于此等待执行
 */
var cache = ( function ( builtInPlugins ) {

	/** @type {Object} 插件存储，加载完成的插件都会存储于此 */
	var plugins 			 	= {};

	/** @type {Object} 内置插件存储 */
	plugins [ PLUGIN_BUILTIN ]  = builtInPlugins;

	/** @type {Object} 自定义插件存储 */
	plugins [ PLUGIN_EXTERNAL ] = {};
			
	var

		/** @type {Object} 元素驱动器存储 */
		drivers 	= {},

		/** @type {Object} 页面跳转与状态切换时的缓存 */
		redirects 	= {},

		/** @type {Object} 模块注入工厂方法缓存 */
		modules 	= {},

		/**
		 * @type {Object} 模块方法队列
		 */
		moduleQueue = {
			page 		: null,
			module 		: []
		};


	/**
	 * 添加插件
	 *
	 * @author JOU
	 * @time   2016-09-23T16:20:25+0800
	 * @param  {String}                 name   插件名称
	 * @param  {Object/Function}       	plugin 插件对象
	 * @param  {String}                 type   插件类型
	 */
	function addPlugin ( name, plugin, type ) {

		if ( name && util.type ( name ) === 'string' ) {
			var _plugin = {};

			_plugin [ name ] = plugin;
			plugin = _plugin;
		}
		
		// 遍历插件对象组依次缓存
		util.foreach ( plugin, function ( item, name ) {
			if ( !plugins [ type ].hasOwnProperty ( name ) ) {
				plugins [ type ][ name ] = item;
			}
			else {
				throw moduleErr ( 'plugin', name + '插件已存在' );
			}
		} );
	}

	/**
	 * 获取插件
	 * 此方法会先从内部方法找，再到外部方法找，如果找到了就返回，没有找打则返回null
	 *
	 * @author JOU
	 * @time   2017-05-14T16:23:35+0800
	 * @param  {String}                 name 插件名字
	 * @return {Object}                      插件对象
	 */
	function getPlugin ( name ) {
		return plugins [ PLUGIN_BUILTIN ][ name ] || plugins [ PLUGIN_EXTERNAL ][ name ] || null;
	}


	/**
	 * 添加元素驱动器
	 *
	 * @author JOU
	 * @time   2016-09-23T16:24:53+0800
	 * @param  {String}                 name   驱动器名称
	 * @param  {Function}               driver 驱动器对象
	 */
	function addDriver ( name, driver ) {

		if ( name && util.type ( name ) === 'string' ) {
			var _driver = {};

			_driver [ name ] = driver;
			driver = _driver;
		}

		// 遍历插件对象组依次缓存
		util.foreach ( driver, function ( item, name ) {
			if ( !drivers.hasOwnProperty.call ( name ) ) {
				drivers [ name ] = item;
			}
			else {
				throw moduleErr ( 'driver', name + '元素驱动器已存在' );
			}
		} );
	}

	/**
	 * 获取元素驱动器
	 *
	 * @author JOU
	 * @time   2017-05-14T16:26:15+0800
	 * @param  {String}                 name 驱动器名称
	 * @return {Object}                      驱动器对象
	 */
	function getDriver ( name ) {
		return drivers [ name ] || null;
	}

	// 曝光接口到外部
	return {
		/**
		 * 将组件的构造对象根据组件类型按传入的组件名进行分类缓存，并返回组件本身
		 * 此方法将会根据type和name查找组件，如果组件已经定义则会抛出错误
		 *
		 * 缓存将保存在cache对象内【@see cache.js】，此对象也是通过此方法构造生成，所以cache对象应该也会在第一时间构造生成以便后续缓存的使用，如果在cache对象生成前缓存对象将会抛出错误	
		 *
		 * @author JOU
		 * @time   2016-09-23T13:40:33+0800
		 * @param  {String}                 component 组件名
		 * @param  {Object}                 component 组件构造对象
		 * @param  {String}                 type      组件类型
		 * @return {Object}                           组件对象或组件对象组
		 */
		componentCreater : function ( name, component, type ) {

			if (type === PLUGIN_BUILTIN || type === PLUGIN_EXTERNAL) {
				addPlugin ( name, component, type );
			}
			else if ( type === TYPE_DRIVER ) {
				addDriver ( name, component );
			}

			return component;
		},

		/**
		 * 根据组件类型和名称获取组件对象，如果不传入type参数则默认获取插件
		 * 当获取插件时，此方法会先查找内部插件是否存在符合条件的插件，如果不存在再从外部插件查找
		 *
		 * @author JOU
		 * @time   2016-09-23T16:22:10+0800
		 * @param  {String}                 name 组件名称
		 * @param  {Number}                 type 组件类型
		 * @return {Object/Function}      anonymous 组件对象
		 */
		componentFactory : function ( name, type ) {

			return type === TYPE_PLUGIN || type === undefined ? getPlugin ( name ) : 
				   type === TYPE_DRIVER ? getDriver ( name ) : null;
		},

		/**
		 * 添加跳转缓存模块
		 *
		 * @author JOU
		 * @time   2016-09-23T16:29:23+0800
		 * @param  {String}                 name     缓存名称
		 * @param  {Multi}                 redirect  缓存模块
		 */
		addRedirect : function ( name, redirect ) {
			if (!redirects.hasOwnProperty ( name ) ) {
				redirects [ name ] = redirect;
			}
			else {
				throw moduleErr ( 'module', name + '页面模块已存在' );
			}
		},

		/**
		 * 获取跳转缓存模块
		 *
		 * @author JOU
		 * @time   2016-09-23T16:33:46+0800
		 * @param  {String}                 name 缓存名称
		 * @return {Multi}                  anonymous 缓存模块
		 */
		getRedirect : function ( name ) {
			return redirects [ name ];
		},

		/**
		 * 添加模块注入后工厂方法
		 *
		 * @author JOU
		 * @time   2016-09-23T16:34:36+0800
		 * @param  {String}                 name    模块名称
		 * @param  {Function}               factory 模块注入后工厂方法
		 */
		addModule : function ( name, factory ) {
			if ( !modules.hasOwnProperty ( name ) ) {
				modules [ name ] = factory;
			}
			else {
				throw moduleErr ( 'module', name + '模块已存在' );
			}
		},

		/**
		 * 获取模块注入后工厂方法
		 *
		 * @author JOU
		 * @time   2016-09-23T16:37:04+0800
		 * @param  {String}                 name      模块名称
		 * @return {Function}               anonymous 模块注入后工厂方法
		 */
		getModule: function ( name ) {
			return modules [ name ];
		},

		/**
		 * 设置ice.page()注入后工厂方法，当页面状态为Loading状态时会将ice.page()注入后工厂方法保存于此等待页面解析完毕并执行
		 *
		 * @author JOU
		 * @time   2016-09-23T16:37:53+0800
		 * @param  {[type]}                 pageFactory [description]
		 */
		setPageFactory : function ( factory ) {
			if ( util.type ( factory ) === 'function' ) {
				moduleQueue.page = factory;
			}
		},

		/**
		 * 添加ice.module()待执行注入后工厂方法，当页面状态不为Ready状态时会将ice.module()注入后工厂方法保存于此等待ice.page()执行完毕并执行
		 *
		 * @author JOU
		 * @time   2016-09-23T16:46:38+0800
		 * @param  {[type]}                 factory [description]
		 */
		addUnexecutedModule : function ( factory ) {
			if ( util.type ( factory ) === 'function') {
				push.call ( moduleQueue.module, factory );
			}
		},

		/**
		 * 调用被缓存的工厂方法
		 *
		 * @author JOU
		 * @time   2016-08-23T12:00:15+0800
		 */
		queueInvoke: function () {
			if ( PAGE_STATE === STATE_PARSED && util.type ( moduleQueue.page ) === 'function') {
				moduleQueue.page ();
			}

			// 依次执行被缓存的module主函数
			else if ( PAGE_STATE === STATE_READY  && moduleQueue.module.length > 0 ) {
				util.foreach ( moduleQueue.module, function ( module ) {
					if ( util.type ( module ) === 'function' ) {
						module ();
					}
				} );
			}
		}
	};
} ) ( {
	event 			: event,
	Promise 		: Promise,
	animation 		: animation,
	language 		: language,
	util			: util,
	http 			: http
} );