/**
 * iceJS v0.1.0
 * (c) 2017-2017 JOU http://icejs.org
 * License: MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/* 声明此文件在jshint检测时的变量不报 "variable" is not defined. */
/* globals window,
	document,
	util,
	argErr,
	split,
	moduleLoader,
	driverLoader,
	config,
	event,
	TYPE_PAGE,
	TYPE_MODULE,
	TYPE_PLUGIN,
	TYPE_DRIVER,
	ice,
	cache,
	slice,
	push,
	concat,

	PAGE_STATE: true,
	STATE_CONFIGED,
	STATE_PARSED,

	urlTransform$,
	setCurrentPath$,
	decomposeArray$,

	single,
	event,
 */

/* 声明此文件在jshint检测时的变量不报 "variable" is defined but never used */
/*  
 */

/**
 * 管控传入的html，使管控后的html表现出符合icejs的特性，一般诸如服务器返回的、个人js添加的新代码会使用到此方法
 * 1、 加载带有ice-src的模块内容
 * 2、 给带有ice-target-module属性和src属性的元素绑定点击事件
 * 3、 加载并运行对应的元素驱动器
 *
 * @author JOU
 * @time   2016-11-28T17:18:15+0800
 * @param  {Object}                 node 		包含新增代码的节点对象或DocumentFragment对象
 * @param  {Boolean} 				 external 	是否为外部调用（外部指的是框架外），外部调用不具有不传参解析当前所有html的功能
 */

function control(node, external) {
	if (external === true) {
		if (node === undefined || node === null || node.nodeType !== 1 && node.nodeType !== 11) {
			throw argErr("function control:node", "control方法要求传入一个有效的node对象或DocumentFragment对象");
		}
	} else if (external === undefined && (node === undefined || node === null)) {
		node = util.s("body");
	}

	var nodes = [],
	    src,
	    cache,
	    state,


	/** @type {Object} 保存浏览器前进/后退前的pathname中所包含的模块信息 */
	before,


	/** @type {Object} 保存浏览器前进/后退后的pathname中所包含的模块信息 */
	after,


	/** @type {Object} 用于在浏览器前进/后退并刷新页面时，再前进/后退时两个页面url中相差的模块信息的保存 */
	differentState = {},
	    _modules,
	    _module,


	// 元素驱动器相关
	loader,
	    driverExp,
	    expMatch,


	// 元素驱动器批量渲染子元素匹配式
	rsubdriver = /^\((.*?)\)::(.*?)$/;

	//////////////////////////////////////////
	// ******* 加载带有ice-src的模块内容 *******
	//

	// 如果根节点也是一个模块定义，则需要将根节点一起处理
	if (node.nodeType === 1 && node.getAttribute(single.aModule) !== null) {
		nodes.push(node);
	}

	nodes = nodes.concat(util.S("*[" + single.aModule + "]", node));
	util.foreach(nodes, function (module) {

		// 过滤nodes数组本身带有的属性或方法
		if (module.nodeType === 1) {
			if (src = module.getAttribute(single.aSrc)) {
				cache = module.getAttribute(single.aCache);

				// 如果在single.moduleRecord中找到了当前加载模块的信息，则使用single.moduleRecord中的模块内容信息去加载内容
				// 此模块信息是由初始化时将pathname解析而来
				// 如果pathname中包含该模块的加载信息，则该模块需根据pathname的信息来加载，否则使用该模块的默认模块信息加载
				src = single.getModuleRecord(module.getAttribute(single.aModule)) || src;

				// 保存当前的路径
				// 用于无刷新跳转时，模块内容替换前的状态保存
				// 这样便可以在后退或前进时找到刷新前的状态
				setCurrentPath$(module, src);

				// 无刷新跳转组件调用来完成无刷新跳转
				single(src, module);
			}
		} else {
			return false;
		}
	});

	/////////////////////////////////////////////////////////
	// 给带有ice-target-module属性和src属性的元素绑定点击事件
	// 给带有ice-target-module属性和action属性的form元素绑定提交事件
	// 点击事件与提交事件都异步请求或提交数据
	//
	util.foreach(util.S("*[" + single.aTargetMod + "]"), function (ajaxElement) {
		if (ajaxElement.nodeName !== "LINK" && ajaxElement.getAttribute(single.aHref)) {
			event.on(ajaxElement, "click", single.requestEvent);
		} else if (ajaxElement.nodeName === "FORM" && ajaxElement.getAttribute(single.aAction)) {
			event.on(ajaxElement, "submit", single.requestEvent);
		}
	});

	// 后退/前进事件绑定
	//
	event.on(window, "popstate", function (event) {

		// 取得在single中通过replaceState保存的state object
		state = single.history.getState(window.location.pathname);

		before = {};
		after = {};
		differentState = {};

		_modules = [];

		if (util.type(state) === "array" && state.length > 0) {

			util.foreach(state, function (item) {

				_modules.push({
					url: item.url,
					entity: util.s("*[" + single.aModule + "=" + item.moduleName + "]"),
					data: item.data
				});
			});

			single(_modules, null, null, state[0].title, null, null, null, null, null, null, true, true);
		} else {

			// 获得跳转前的模块信息
			decomposeArray$(split.call(single.history.signature, "/"), function (key, value) {
				before[key] = value;
			});

			// 获得跳转后的模块信息
			decomposeArray$(split.call(window.location.pathname, "/"), function (key, value) {
				after[key] = value;
			});

			// 对比跳转前后url所体现的变化module信息，根据这些不同的模块进行加载模块内容
			util.foreach(after, function (afterItem, key) {
				if (before[key] !== afterItem) {
					differentState[key] = afterItem;
				}
			});

			util.foreach(before, function (afterItem, key) {
				if (after[key] !== afterItem) {
					differentState[key] = null;
				}
			});

			// 根据对比跳转前后变化的module信息，遍历重新加载
			util.foreach(differentState, function (src, moduleName) {
				_module = util.s("*[" + single.aModule + "=" + moduleName + "]");

				src = src === null ? _module.getAttribute(single.aSrc) : src;

				_modules.push({
					url: src,
					entity: _module,
					data: null
				});
			});

			single(_modules, null, null, config.params.header[_modules[0].url], null, null, null, null, null, null, true, true);
		}

		// if (state) {
		// 	// 是否有逆状态方法缓存，有则调用，并移除此缓存
		// 	if(inverseFuncCache.hasOwnProperty(location.pathname)) {
		// 		var _inverseFunc = inverseFuncCache[location.pathname];
		// 		// 移除此逆状态方法
		// 		delete inverseFuncCache[location.pathname];

		// 		if (_inverseFunc) {
		// 			eval(_inverseFunc + "()");
		// 		}
		// 	}
		// 	// 在没有逆状态方法缓存的情况下，判断当前地址是否为状态地址，即有@符号的，有则调用
		// 	else if (state.url.status && state.url.status.indexOf("@") === 0) {
		// 		var funcInvokeName = state.url.status.substr(1);
		// 		inverseFuncCache[previousPathname] = state.url.inverseFunc;

		// 		eval(funcInvokeName + "()");
		// 	}
		// 	else {
		//  	$("title").html(state.title);

		//  	// 读取本地数组缓存
		//  	if (window.pageCache.hasOwnProperty(state.url)) {
		//  		document.querySelector("html").innerHTML = window.pageCache[state.url];
		//  		console.log(document.querySelector("head"));
		//  	}
		//     	// 如果没有本地数组缓存则ajax重新请求再放入缓存
		//     	else {
		//     		// 加载数据
		//     		loading(state.url);
		//     		window.pageCache[state.url] = document.querySelector("html").innerHTML;
		//     	}
		// 	}
		// }
	});

	/////////////////////////////////////////////////////////
	// 加载元素驱动器
	// 
	loader = DriverLoader.create();

	util.foreach(util.S("*[" + elementDriver.aDriver + "]"), function (driverable) {

		// 获取元素驱动器表达式
		driverExp = driverable.getAttribute(elementDriver.aDriver);

		if (expMatch = rsubdriver.exec(driverExp)) {
			driverable = util.S(expMatch[1], driverable);
		}

		// 将待加载元素添加到加载器内
		loader.instance.putWaiting(elementDriver(driverable, expMatch[2], loader.id));
	});
}

/**
 * 模块处理方法，ice.page、ice.module、plugin和driver的内部实现都是调用的此方法。
 * 此方法主要实现了deps数组的动态加载并依赖注入到factory中，根据页面状态来处理factory函数
 *
 * @author JOU
 * @time   2016-08-21T12:43:18+0800
 * @param  {String}        			 name    	模块名
 * @param  {Array}                 	 deps 		依赖项数组
 * @param  {Function}                factory    模块执行方法
 * @param  {Number}                  type       模块类型
 */
function module$1(name, deps, factory, type) {

	/** @type {Object} 动态加载插件时的script标签 */
	var module,
	    rargs = /^function\s*\((.*)\)\s*/,
	    args = rargs.exec(factory.toString())[1].split(","),


	// 如果模块类型为plugin，则name将传入一个包含name和guid的对象
	guid = type !== TYPE_PLUGIN ? guid$() : name.guid,


	// 正在加载的模块数
	loading = 0,
	    loader;

	util.foreach(args, function (arg, index, args) {
		args[index] = util.trim(arg);
	});

	// 通过所使用插件过滤所需的加载项
	deps = util.type(deps) === "array" ? deps.slice(0, args.length - 1) : deps;

	module = {
		type: type,
		deps: deps,
		factory: factory,
		args: args
	};

	// 只有在加载插件类型的模块时才不创建ModuleLoader加载器
	if (type !== TYPE_PLUGIN) {

		// 创建moduleLoader对象并将此模块保存于loadModule中
		loader = ModuleLoader.create(guid, name, module);
	} else {
		loader = ModuleLoader.loaders[guid];

		loader.putLoad(name.name, module);
	}

	// 遍历依赖，如果模块未被加载，则放入waiting中等待加载完成
	util.foreach(deps, function (dep) {

		// 模块名可使用“.“作为命名空间分隔，将依赖项名字中的“.”统一转换为“/”
		dep = urlTransform$(dep);
		if (!cache.componentFactory(dep, TYPE_PLUGIN)) {

			// 放入moduleLoader.context.waiting数组中等待加载
			loader.putWaiting(dep);

			// 加载模块
			var script = document.createElement("script");
			script.src = config.params.base.plugin + dep + ModuleLoader.suffix + "?m=" + dep + "&guid=" + guid;
			script.setAttribute(ModuleLoader.moduleName, dep);
			script.setAttribute(ModuleLoader.scriptFlag, "");
			script.setAttribute(ModuleLoader.loaderID, guid);

			util.appendScript(script, ModuleLoader.onScriptLoaded);

			loading++;
		}
	});

	// 如果顶层执行模块没有待加载的模块参数，则直接执行
	if (loading === 0 && name === ModuleLoader.topModuleName) {
		ModuleLoader.factoryInvoke(ModuleLoader.inject(module, loader), type);
	}
}

// 页面DOM结构加载完成时执行初始化
// 如果调用此函数时DOM结构已经加载完成，则立即执行初始化
(function (init) {

	if (document.readyState === "complete") {
		init();
	} else {
		function completed() {
			event.remove(document, "DOMContentLoaded", completed);
			event.remove(window, "load", completed);
			init();
		}

		event.on(document, "DOMContentLoaded", completed);
		event.on(window, "load", completed);
	}
})(
// icejs初始化
// #此方法所做工作如下：
// 1、 如果开发者调用了config配置，则加载config配置项。配置项以ajax同步的方式加载，跨域加载请确保在HTML5环境下运行，且服务器端需设置响应头为：
// 	[Access-Control-Allow-Origin:*]
//     [Access-Control-Allow-Methods:POST,GET"]
// 2、 管控页面结构，使之表现出具有icejs的特性
// 3、 解析完页面后将PAGE_STATE置为STATE_PARSED
// 4、 执行缓存的page()（此方法主要防止异步执行时ice.page()和_init()的顺序错乱问题，_init()必须在ice.page()前执行）
function () {

	//////////////////////////////////////////
	// 管控页面结构块
	function chunk() {
		control();

		// if ( util.isEmpty ( driverLoader ) ) {
		PAGE_STATE = STATE_PARSED;
		event.emit("page");
		// }
	}

	if (PAGE_STATE === STATE_CONFIGED) {
		chunk();
	} else {
		event.on("parse", chunk, false, true);
	}
	//////////////////////////////////////////
	//
	//


	// 初始化url中的模块信息到single.moduleRecord中
	decomposeArray$(split.call(window.location.pathname, "/"), function (key, value) {
		single.setModuleRecord(key, value);
	});

	// 初始化一条将当前页的空值到single.history.state中
	single.history.setState(window.location.pathname, null);

	//////////////////////////////////////////
	// 将初始化状态设置为解析完成当前页面元素且执行完成ice.page
	// 
	PAGE_STATE = STATE_PARSED;

	// 执行缓存的page
	cache.queueInvoke();
});

//
//
//////////////////////////////////////////
// ice对象继承page、module方法
util.extend(ice, {
	/**
  * 页面初始化，异步执行方法，一个页面只能调用一次此方法
  * ice.page()会在所有模块方法执行前执行
  * ice.page()只有在PAGE_STATE=1时可执行，否则会将factory函数处理好缓存于moduleQueue中，等待PAGEutil.STATE置为1时立即执行
  *
  * @author JOU
  * @time   2016-08-21T12:31:04+0800
  * @param  {Array}                 	 deps 依赖项数组
  * @param  {factory}                 factory      模块执行方法
  * @return {Object} 							  ice对象
  */
	page: function (deps, factory) {

		// 判断参数合法性
		// 当传入参数只有一个且此参数类型是function时，参数合法并纠正参数
		if (arguments.length === 0) {
			throw argErr("function ice.page", "至少需要传入模块主函数参数");
		} else if (deps && !factory) {
			factory = deps;
			deps = [];
		}

		var tdeps = util.type(deps),
		    tfactory = util.type(factory);

		// deps = undefined(or)null(or)array
		if (deps !== undefined && deps !== null && tdeps !== "array") {
			throw argErr("function ice.page:dependence", "方法第一个参数类型为Array，也可不传入第一个参数或传入null，方法将自动忽略此参数");
		}

		// factory参数必须为function
		if (tfactory !== "function") {
			throw argErr("function ice.page:factory", "至少需要传入模块主函数参数，而不是其他类型参数");
		}

		event.on("page", function () {
			module$1(ModuleLoader.topModuleName, deps, factory, TYPE_PAGE);
		});
	},

	/**
  * 模块定义方法，异步执行方法，与ice.page()的功能基本相同。ice.module()会在初始化完成，即PAGE_STATE=2时立即执行此方法，否则将缓存于moduleQueue，等待PAGE_STATE置为2时立即执行
  *
  * 此方法永远不会先于ice.page()执行前执行	
  *
  * @author JOU
  * @time   2016-08-21T12:36:36+0800
  * @param  {}                 deps [description]
  * @param  {Array}                 	 deps 依赖项数组
  * @param  {factory}                 factory      模块执行方法
  * @return {Object} 							  ice对象
  */
	module: function (deps, factory) {

		// 判断参数合法性
		// 当传入参数只有一个且此参数类型是function时，参数合法并纠正参数
		if (arguments.length === 0) {
			throw argErr("function ice.module", "至少需要传入模块主函数参数");
		} else if (deps && !factory) {
			factory = deps;
			deps = [];
		}

		var tdeps = util.type(deps),
		    tfactory = util.type(factory);

		// deps = undefined(or)null(or)array
		if (deps !== undefined && deps !== null && tdeps !== "array") {
			throw argErr("function ice.module:dependence", "方法第一个参数类型为Array，也可不传入第一个参数或传入null，方法将自动忽略此参数");
		}

		// factory参数必须为function
		if (tfactory !== "function") {
			throw argErr("function ice.module:factory", "至少需要传入模块主函数参数，而不是其他类型参数");
		}

		module$1(ModuleLoader.topModuleName, deps, factory, TYPE_MODULE);
	},

	/** 
  * 管控传入的html(@see function control)，此方法为外部调用方法，只能传递一个参数
  *
  * @author JOU
  * @time   2017-01-16T19:46:38+0800
  * @param  {Object}                 node 包含新增代码的节点对象或DocumentFragment对象
  * @return {[type]}                      [description]
  */
	control: function (node) {
		return control(node, true);
	}
});

// window全局对象继承plugin、driver方法
util.extend(window, {

	/**
  * 插件定义方法，此方法传入依赖插件数组deps和factory对象(factory可以为函数)
  *
  * @author JOU
  * @time   2016-09-06T11:52:59+0800
  * @param  {Array}                 	  deps    依赖插件数组
  * @param  {Function}                 factory 插件工厂方法
  */
	plugin: function (deps, factory) {

		// 判断参数合法性
		// 当传入参数只有一个且此参数类型是function时，参数合法并纠正参数
		if (arguments.length === 0) {
			throw argErr("function ice.plugin", "至少需要传入模块主函数参数");
		} else if (deps && !factory) {
			factory = deps;
			deps = [];
		}

		var tdeps = util.type(deps),
		    tfactory = util.type(factory);

		// deps = undefined(or)null(or)array
		if (deps !== undefined && deps !== null && tdeps !== "array") {
			throw argErr("function ice.plugin:dependence", "方法第一个参数类型为Array，也可不传入第一个参数或传入null，方法将自动忽略此参数");
		}

		// factory参数必须为function
		if (tfactory !== "function") {
			throw argErr("function ice.plugin:factory", "至少需要传入模块主函数参数，而不是其他类型参数");
		}

		module$1(ModuleLoader.getCurrentModule() || "", deps, factory, TYPE_PLUGIN);
	},

	/**
  * 元素驱动器定义方法，此方法传入依赖插件数组deps和factory对象(factory可以为函数)
  *
  * @author JOU
  * @time   2016-09-06T11:56:47+0800
  * @param  {Array}                 	  deps    依赖插件数组
  * @param  {Function}                 factory 插件工厂方法
  */
	driver: function (deps, factory) {

		// 判断参数合法性
		// 当传入参数只有一个且此参数类型是function时，参数合法并纠正参数
		if (arguments.length === 0) {
			throw argErr("function ice.driver", "至少需要传入模块主函数参数");
		} else if (deps && !factory) {
			factory = deps;
			deps = [];
		}

		var tdeps = util.type(deps),
		    tfactory = util.type(factory);

		// deps = undefined(or)null(or)array
		if (deps !== undefined && deps !== null && tdeps !== "array") {
			throw argErr("function ice.driver:dependence", "方法第一个参数类型为Array，也可不传入第一个参数或传入null，方法将自动忽略此参数");
		}

		// factory参数必须为function
		if (tfactory !== "function") {
			throw argErr("function ice.driver:factory", "至少需要传入模块主函数参数，而不是其他类型参数");
		}

		module$1(ModuleLoader.topModuleName, deps, factory, TYPE_DRIVER);
	}
});

})));
