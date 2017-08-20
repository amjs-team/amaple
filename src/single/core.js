import { extend, type, foreach, replaceAll, noop, isPlainObject } from "../func/util";
import { attr, html } from "../func/node";
import { envErr } from "../error";
import singleAttr from "./singleAttr";
import clsProperty from "./clsProperty";
import requestEventBind from "./requestEventBind";
import compileModule from "./compileModule";
import configuration from "../core/configuration/core";
import cache from "../cache/core";
import http from "../http/core";
import event from "../event/core";

/**
	single ( url: String|Object, moduleElem: DMOObject, data?: String|Object, method?:String, timeout?: Number, before?: Function, success?: Function, error?: Function, abort?: Function, pushStack?: Boolean, onpopstate?: Boolean )

	Return Type:
	void

	Description:
	根据url请求html并将html放入module（module为模块节点）
	如果pushStack为true则将url和title压入history栈内。如果pushStack不为true，则不压入history栈内
	浏览器前进/后退调用时，不调用pushState方法
	
	此函数可通过第一个参数传入数组的方式同时更新多个模块
	多模块同时更新时的参数格式为：
	[
		{url: url1, entity: moduleElem1, data: data1},
		{url: url2, entity: moduleElem2, data: data2},
		...
	], timeout, before, success, error, abort, pushStack, onpopstate

	URL doc:
	http://icejs.org/######
*/
export default function single ( url, moduleElem, data, method, timeout, before = noop, success = noop, error = noop, abort = noop, pushStack, onpopstate ) {

	let moduleName, aCache, isCache, isBase, modules, historyMod, html,

		// 模块内容缓存key
		directionKey, 


		//////////////////////////////////////////////////
		/// 请求url处理相关

		// 完整请求url初始化
		fullUrl, 
		hasSeparator,

		// 上一页面的路径
		lastPath,

		_state = [];

	const 
		// 模块名占位符
		modPlaceholder = ":m",

		// 模块内容标识占位符
		conPlaceholder = ":v",

		// 临时保存刷新前的title
		currentTitle = document.title;

	// 判断传入的url的类型，如果是string，是普通的参数传递，即只更新一个模块的数据； 如果是array，它包括一个或多个模块更新的数据
	// 需统一为modules数组
	modules = type ( url ) === "string" ? [ { url : url, entity : moduleElem, data : data } ] : url;

	
	// 循环modules，依次更新模块
	foreach ( modules, ( module, i ) => {

		moduleName 		= attr ( module.entity, single.aModule );
		directionKey 	= moduleName + "_" + module.url;

		// aCache 			= attr ( module.entity, single.aCache );
		// isCache 		= aCache === "true" || ( configuration.getConfigure ( redirectCache ) === true && aCache !== "false" );
		isBase 			= attr ( module.entity, single.aBase ) !== "false" && configuration.getConfigure ( baseUrl ).length > 0;

		// cache已有当前模块的缓存时，才使用缓存
		// 根据不同的code来刷新不同模块也一定需要重新请求
		if ( historyMod = cache.getDirection ( directionKey ) ) {

			html ( module.entity, historyMod );
		}
		else {

			fullUrl = configuration.getConfigure ( urlRule );

			// 通过url规则转换url，并通过ice-base来判断是否添加base路径
			fullUrl = replaceAll ( fullUrl || "", modPlaceholder, moduleName );
			fullUrl = replaceAll ( fullUrl || "", conPlaceholder, module.url );

			hasSeparator = fullUrl.indexOf ( "/" );
			fullUrl = isBase ? configuration.getConfigure ( baseUrl ) +  ( hasSeparator === 0 ? fullUrl.substr( 1 ) : fullUrl )
							  :
							  hasSeparator === 0 ? fullUrl : "/" + fullUrl;
							  
			// 请求模块跳转页面数据
			http.request ( {

				url 		: fullUrl, 
				data 		: module.data || "",
				method 		: /^(GET|POST)$/i.test ( method ) ? method.toUpperCase () : "GET",
				timeout 	: timeout || 0,
				beforeSend 	: function () {
					before ( module );
				},
				abort: function () {
					abort ( module );
				},

			} ).done ( ( moduleString, status, xhr ) => {

            	// 解析请求module
				compiler = compileModule ( moduleString );
            	if ( isPlainObject ( module.entity ) ) {
                	module.entity = module.entity [ xhr.getResponseHeader ( "code" ) ];
            	}
				/////////////////////////////////////////////////////////
				// 将请求的html替换到module模块中
				html ( module.entity, html );

				/////////////////////////////////////////////////////////
				// 如果需要缓存，则将html缓存起来
				//
				module.isCache === true && cache.addRedirect ( directionKey, html );

				if ( compiler.title ) {
                	document.title = compiler.title;
				}

				// 调用success回调
				success ( module );
			} ).fail ( error => {
            	error ( module, error );
			} );

		}


		// 先保存上一页面的path用于上一页面的状态保存，再将模块的当前路径更新为刷新后的url
		lastPath = getCurrentPath$ ( module.entity );
		setCurrentPath$ ( module.entity, module.url );

		_state.push ( {
			url 		: lastPath,
			moduleName 	: moduleName,
			data 		: module.data,
			title 		: i === "0" ? currentTitle : undefined
		} );

		if ( pushStack === true ) {
			single.setModuleRecord ( moduleName, module.url, true );
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

			if ( onpopstate !== true ) {
				single.history.push ( null, modules [ 0 ].title, single.getFormatModuleRecord () );
			}

			// 初始化一条将当前页的空值到single.history.state中
			single.history.setState ( window.location.pathname, null );
			
		}
		else {
			throw envErr ( "History API", "浏览器不支持HTML5 History API" );
		}
	}
}

//////////////////////////////////////////
// module无刷新跳转相关属性通用参数，为避免重复定义，统一挂载到single对象上
// single相关静态变量与方法
extend ( single, singleAttr, clsProperty, { requestEventBind } );