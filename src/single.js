'use strict';

/* jshint -W030 */
/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals util,
	config,
	cache,
	substr,
	http.get,
	setCurrentPath$,
	getCurrentPath$,
	envErr,
	moduleErr,
	push,
	join,
	document,
	_module,
	window,
	http,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported crystals,

 */


/** 
 * 根据url请求html，并将html放入module（module为模块节点），如果pushStack为true则将url和title压入history栈内。如果pushStack不为true，则不压入history栈内。
 * 浏览器前进/后退调用时，不调用pushState方法
 *
 * 此函数可通过第一个参数传入数组的方式同时更新多个模块，此时module的值代表pushStack的值，title的值代表onpopstate的值（方法体中将纠正参数）
 * 第一个参数传入数组时，格式为：
 * [
 * 		{url: url1, entity: module1, title: title1, isCache: isCache1}
 * 		{url: url2, entity: module2, title: title2, isCache: isCache2}
 * 		...
 * 	]
 *
 * @author JOU
 * @time   2017-01-20T15:48:04+0800
 * @param  {String/Object}          url        请求路径或请求数据对象
 * @param  {Object/Boolean}         module     模块节点（当url为请求数据对象时为pushStack的值）
 * @param  {String/Boolean}         title      标题名称（当url为请求数据对象时为onpopstate的值）
 * @param  {Boolean/Null} 	        isCache    是否缓存（当url为请求数据对象时为null）
 * @param  {Boolean/Null} 	        pushStack  是否压入history栈内（当url为请求数据对象时为null）
 * @param  {Boolean/Null} 	        onpopstate 是否为浏览器前进/后退时调用（当url为请求数据对象时为null）
 */
function single ( url, module, title, isCache, pushStack, onpopstate ) {

	var 
		type,
		moduleName, 

		modules, 

		historyMod, html, 

		/** @type {String} 模块名占位符 */
		modPlaceholder 	= ':m',

		/** @type {String} 模块内容标识占位符 */
		conPlaceholder 	= ':v',


		/** @type {String} 模块内容缓存key */
		redirectKey, 


		//////////////////////////////////////////////////
		/// 请求url处理相关
		///

		/** @type {String} 完整请求url初始化 */
		complateUrl, 
		hasSeparator,


		/** @type {String} 临时保存刷新前的title */
		currentTitle,

		/** @type {String} 上一页面的路径 */
		lastPath,

		_state 			= [];

	// 判断传入的url的类型，如果是string，是普通的参数传递，即只更新一个模块的数据； 如果是array，它包括一个或多个模块更新的数据
	if ( util.type ( url ) === 'string' ) {

		// 参数无需纠正
		modules 		= [{
							url 	: url, 
							entity 	: module, 
							title 	: title, 
							isCache : isCache
						}];
	}
	else {
		modules 		= url;

		// 纠正参数
		pushStack 		= module;
		onpopstate 		= title;
	}



	// 循环modules，依次更新模块
	util.foreach ( modules, function ( _module ) {

		type 			= util.type ( _module.title );
		moduleName 		= _module.entity.getAttribute ( single.aModule );
		redirectKey 	= moduleName + '_' + _module.url;
		complateUrl 	= config.params.urlRule;

		// isCache=true且cache已有当前模块的缓存时，才使用缓存
		if ( _module.isCache === true && ( historyMod = cache.getRedirect ( redirectKey ) ) ) {
			util.html ( _module.entity, historyMod );
		}
		else {

			// 通过url规则转换url，并通过ice-base来判断是否添加base路径
			complateUrl 	= util.replaceAll ( complateUrl || '', modPlaceholder, moduleName );
			complateUrl 	= util.replaceAll ( complateUrl || '', conPlaceholder, _module.url );


			hasSeparator 	= complateUrl.indexOf ( '/' );
			complateUrl 	= _module.entity.getAttribute ( single.aBase ) !== 'false' && config.params.base.url.length > 0 ?  
							  config.params.base.url +  ( hasSeparator === 0 ? substr.call ( complateUrl, 1 ) : complateUrl )
							  :
							  hasSeparator === 0 ? complateUrl : '/' + complateUrl;


			http.get ( complateUrl ).done ( function ( result ) {
				try {

					result 	= JSON.parse ( result );
					html 	= result [ config.params.htmlKey ];

				} catch ( e ) {
					html 	= result;
				}

				/////////////////////////////////////////////////////////
				// 将请求的html替换到module模块中
				//
				util.html ( _module.entity, html );

				/////////////////////////////////////////////////////////
				// 如果需要缓存，则将html缓存起来
				//
				_module.isCache === true && cache.addRedirect ( redirectKey, html );

				// 将_module.title统一为字符串
				// 如果没有获取到字符串则为null
				_module.title = type === 'string'   ? _module.title : 
							  	type === 'function' ? _module.title ( result [ config.params.codeKey ] || null ) || null : null;
			} );


			if ( util.type ( _module.title ) === 'string' ) {

				currentTitle 	= document.title;
				document.title 	= _module.title;
			}

			// 先保存上一页面的path用于上一页面的状态保存，再将模块的当前路径更新为刷新后的url
			lastPath = getCurrentPath$ ( _module.entity );
			setCurrentPath$ ( _module.entity, _module.url );

			push.call ( _state,  {
				url 		: lastPath,
				moduleName 	: moduleName,
				cache 		: _module.isCache,
				title 		: currentTitle
			} );


			pushStack === true && single.setModuleRecord ( moduleName, _module.url, true );
		}
	} );

	// 判断是否调用pushState
	if (pushStack === true) {

		// 需判断是否支持history API新特性
		if (single.history.entity.pushState) {


			/////////////////////////////////////////////////////////
			// 保存跳转前的页面状态
			//

			single.history.setState ( single.history.signature, _state, true );

			// console.log(single.getFormatModuleRecord ());
			onpopstate === true || single.history.push ( null, _module.title, single.getFormatModuleRecord () );

			// 初始化一条将当前页的空值到single.history.state中
			single.history.setState ( window.location.pathname, null );
			
		}
		else {
			throw envErr ( 'History API', '浏览器不支持HTML5 History API' );
		}
	}
}

//////////////////////////////////////////
// module无刷新跳转相关属性通用参数，为避免重复定义，统一挂载到single对象上
//
util.extend ( single, {
	aModule 		: 'ice-module',
	aSrc 			: 'ice-src',
	aCache 			: 'ice-cache',
	aBase 			: 'ice-base',
	aLoading 		: 'ice-loading',
	aFinish 		: 'ice-finish',

	aHref			: 'href',
	aAction 		: 'action',
	aTargetMod 		: 'ice-target-module'
} );


util.extend ( single, {

	/** @type {Object} window.history封装 */
	history : {

		/** @type {Object} window.history对象 */
		entity  	: window.history,

		/**
		 * 对history.replaceState方法的封装
		 *
		 * @author JOU
		 * @time   2017-03-25T13:29:44+0800
		 * @param  {Object}                 state 参数传递对象
		 * @param  {String}                 title 标题
		 * @param  {String}                 url   刷新的url
		 */
		replace 	: function ( state, title, url ) {
			this.entity.replaceState ( state, title, url );
		},

		/**
		 * 对history.pushState方法的封装
		 *
		 * @author JOU
		 * @time   2017-03-25T13:29:44+0800
		 * @param  {Object}                 state 参数传递对象
		 * @param  {String}                 title 标题
		 * @param  {String}                 url   刷新的url
		 */
		push 		: function ( state, title, url ) {
			this.entity.pushState ( state, title, url );
		},

		/**
		 * 获取参数传递对象
		 *
		 * @author JOU
		 * @time   2017-03-25T13:32:12+0800
		 * @return {Object}                 参数传递对象
		 */
		getOriginalState 	: function () {
			return this.entity.state;
		},

		////////////////////////////////////
		/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
		/// 
		state 		: {},

		/** @type {Object} 状态记录标记 */
		signature 	: null,

		/**
		 * 设置状态记录，并标记此条记录
		 * 先查找key对应的记录，找到时更新此记录并标记，未找到时添加一条记录并标记
		 *
		 * 注意：mode为true时不标记此条记录
		 * 
		 * @author JOU
		 * @time   2017-03-26T13:55:55+0800
		 * @param  {String}                 key   记录key
		 * @param  {Boolean}                mode  模式
		 * @param  {Object}                 value 记录值
		 */
		setState 	: function ( key, value, mode ) {

			this.state [ key ] = value;

			mode === true  || ( this.signature 	= key );
		},

		/**
		 * 获取对应记录
		 *
		 * @author JOU
		 * @time   2017-03-26T13:58:06+0800
		 * @param  {String}                 key 记录key
		 * @return {Object}                     记录值
		 */
		getState 	: function ( key ) {

			return this.state [ key ];
		}
	},


	////////////////////////////////////
	/// 模块路径记录数组
	/// 记录页面的所有模块名及对应模块中当前所显示的模块内容
	/// 
	moduleRecord : {},

	/**
	 * 将最新的模块和对应的模块内容标识添加或更新到moduleRecord数组中
	 * filter = true时过滤moduleRecord数组中不存在于当前页面中的模块记录，filter = false时不过滤
	 *
	 * @author JOU
	 * @time   2017-03-26T21:24:54+0800
	 * @param  {String}                 moduleName 模块名称
	 * @param  {String}                 value      模块内容标识
	 * @param  {Boolean}                filter     是否过滤
	 */
	setModuleRecord : function ( moduleName, value, filter ) {

		// 更新或添加一项到moduleRecord数组中
		single.moduleRecord [ moduleName ] = value;

		if ( filter === true ) {

			// 过滤moduleRecord数组中不存在于当前页面中的模块记录
			var _record 		= {};

			util.foreach ( single.moduleRecord, function ( recordItem, key ) {
				util.type ( util.s ( '*[ice-module=' + key + ']' ) ) === 'object' && ( _record [ key ] = recordItem );
			});

			single.moduleRecord 	= _record;
		}
	},

	/**
	 * 获取对应模块名称的模块内容标识
	 *
	 * @author JOU
	 * @time   2017-03-26T21:48:42+0800
	 * @param  {String}                 moduleName 模块名称
	 * @return {String}                            模块内容标识
	 */
	getModuleRecord : function ( moduleName ) {
		return single.moduleRecord [ moduleName ];
	},

	/**
	 * 获取moduleRecord格式化为pathname后的字符串
	 *
	 * @author JOU
	 * @time   2017-03-26T21:58:39+0800
	 * @return {String}                 格式化为pathname的字符串
	 */
	getFormatModuleRecord : function () {
		var 
			_array = [];

		util.foreach ( single.moduleRecord, function ( recordItem, key ) {
			push.call ( _array, key + ( config.params.moduleSeparator || '' ) + recordItem );
		} );


		return '/' + join.call ( _array, '/' );
	},

	/**
	 * 点击无刷新跳转的事件封装，预先绑定到同时具有href和ice-target-module两个属性的Node中
	 *
	 * @author JOU
	 * @time   2017-03-04T23:03:56+0800
	 * @param  {Object}                 e 事件回调参数event
	 */
	click 	: function ( e ) {

		var 

			/** 临时存储目标模块名称 */
			_moduleName 	= this.getAttribute ( single.aTargetMod ),

			src 			= this.getAttribute ( single.aHref ),

			cache 			= this.getAttribute ( single.aCache ),

			/** 获取当前按钮操作的模块 */
			module				= util.s ( '*[' + single.aModule + '=' + _moduleName + ']' );

		e.preventDefault ();
		if ( util.type ( module ) === 'object' ) {

			// 调用single方法
			getCurrentPath$ ( module ) === src || 
			single ( src, module, config.params.header [ src ], 

					// 模块定义ice-cache="true"，或配置文件定义redirectCache为true且模块没有定义为false
					cache === 'true' || ( config.params.redirectCache === true && cache !== 'false' ), true );
		}
		else {
			throw moduleErr ( 'module', '找不到' + _moduleName + '模块' );
		}
	}
} );