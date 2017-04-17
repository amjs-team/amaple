'use strict';

/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals moduleErr,
	_typeof,
	_forEach,
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
var cache = (function() {
	/** @type {Object} 插件存储，加载完成的插件都会存储于此 */
	var plugins 	= {
			/** @type {Object} 内置插件存储 */
			builtIn 	: {},
			/** @type {Object} 自定义插件存储 */
			external 	: {}
		},

		/** @type {Object} 元素驱动器存储 */
		drivers 	= {},

		/** @type {Object} 页面跳转与状态切换时的缓存 */
		redirects 	= {},

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
	function addPlugin(plugin, type) {
		// 遍历插件对象组依次缓存
		_forEach(plugin, function(item, name) {
			if (!hasOwnProperty.call(plugins[type], name)) {
				plugins[type][name] = item;
			}
			else {
				throw moduleErr('plugin', name + '插件已存在');
			}
		});
	}


	/**
	 * 添加元素驱动器
	 *
	 * @author JOU
	 * @time   2016-09-23T16:24:53+0800
	 * @param  {String}                 name   驱动器名称
	 * @param  {Function}               driver 驱动器对象
	 */
	function addDriver(driver) {
		// 遍历插件对象组依次缓存
		_forEach(driver, function(item, name) {
			if (!hasOwnProperty.call(drivers, name)) {
				drivers[name] = item;
			}
			else {
				throw moduleErr('driver', name + '元素驱动器已存在');
			}
		});
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
		componentCreater: function(name, component, type) {
			var tmp,
				tname = _typeof(name);

			// 当未传入组件名，而是直接传入组件对象组时，将组件对象组传入cache对象缓存
			if (tname === 'object') {
				type 		= component;
				component 	= name;
				name 		= undefined;
			}
			else {
				tmp 		= component;
				component 	= {};
				component[name] = tmp;
			}

			if (type === PLUGIN_BUILTIN || type === PLUGIN_EXTERNAL) {
				addPlugin(component, type);
			}
			else if (type === TYPE_DRIVER) {
				addDriver(component);	
			}

			return tmp || component;
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
		componentFactory: function(name, type) {
			return (type === TYPE_PLUGIN || type === undefined) ? 
				   (plugins[PLUGIN_BUILTIN][name] || plugins[PLUGIN_EXTERNAL][name]) :
				   		type === TYPE_DRIVER ? drivers[name] : null;
		},

		/**
		 * 添加跳转缓存模块
		 *
		 * @author JOU
		 * @time   2016-09-23T16:29:23+0800
		 * @param  {String}                 name     缓存名称
		 * @param  {Multi}                 redirect  缓存模块
		 */
		addRedirect: function(name, redirect) {
			if (!hasOwnProperty.call(redirects, name)) {
				redirects[name] = redirect;
			}
			else {
				throw moduleErr('module', name + '页面模块已存在');
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
		getRedirect: function(name) {
			return redirects[name];
		},

		/**
		 * 添加模块注入后工厂方法
		 *
		 * @author JOU
		 * @time   2016-09-23T16:34:36+0800
		 * @param  {String}                 name    模块名称
		 * @param  {Function}               factory 模块注入后工厂方法
		 */
		// addModule: function(name, factory) {
		// 	if (!hasOwnProperty.call(modules, name)) {
		// 		modules[name] = factory;
		// 	}
		// 	else {
		// 		throw moduleErr('module', name + '模块已存在');
		// 	}
		// },

		/**
		 * 获取模块注入后工厂方法
		 *
		 * @author JOU
		 * @time   2016-09-23T16:37:04+0800
		 * @param  {String}                 name      模块名称
		 * @return {Function}               anonymous 模块注入后工厂方法
		 */
		// getModule: function(name) {
		// 	return modules[name];
		// },

		/**
		 * 设置ice.page()注入后工厂方法，当页面状态为Loading状态时会将ice.page()注入后工厂方法保存于此等待页面解析完毕并执行
		 *
		 * @author JOU
		 * @time   2016-09-23T16:37:53+0800
		 * @param  {[type]}                 pageFactory [description]
		 */
		setPageFactory: function(factory) {
			if (_typeof(factory) === 'function') {
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
		addUnexecutedModule: function(factory) {
			if (_typeof(factory) === 'function') {
				push.call(moduleQueue.module, factory);
			}
		},

		/**
		 * 调用被缓存的工厂方法
		 *
		 * @author JOU
		 * @time   2016-08-23T12:00:15+0800
		 */
		queueInvoke: function() {
			if (PAGE_STATE === STATE_PARSED && _typeof(moduleQueue.page) === 'function') {
				moduleQueue.page();
			}

			// 依次执行被缓存的module主函数
			else if (PAGE_STATE === STATE_READY  && moduleQueue.module.length > 0) {
				_forEach(moduleQueue.module, function(module) {
					if (_typeof(module) === 'function' ) {
						module();
					}
				});
			}
		}
	};
})();