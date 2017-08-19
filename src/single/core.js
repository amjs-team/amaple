import { extend, type, foreach, replaceAll, noop, isPlainObject } from "../func/util";
import { attr, html } from "../func/node";
import { envErr } from "../error";
import singleAttr from "./singleAttr";
import clsProperty from "./clsProperty";
import requestHandler from "./requestHandler";
import cache from "../cache/core";
import http from "../http/core";
import event from "../event/core";

/**
	single ( url: String|Object, module: DMOObject, data?: String|Object, method?:String, timeout?: Number, before?: Function, success?: Function, error?: Function, abort?: Function, pushStack?: Boolean, onpopstate?: Boolean )

	Return Type:
	void

	Description:
	根据url请求html并将html放入module（module为模块节点）
	如果pushStack为true则将url和title压入history栈内。如果pushStack不为true，则不压入history栈内
	浏览器前进/后退调用时，不调用pushState方法
	
	此函数可通过第一个参数传入数组的方式同时更新多个模块
	多模块同时更新时的参数格式为：
	[
		{url: url1, entity: module1, data: data1},
		{url: url2, entity: module2, data: data2},
		...
	], timeout, before, success, error, abort, pushStack, onpopstate

	URL doc:
	http://icejs.org/######
*/
export default function single ( url, module, data, method, timeout, before = noop, success = noop, error = noop, abort = noop, pushStack, onpopstate ) {

	let 
		moduleName, aCache, isCache, isBase, modules, historyMod, html,

		// 模块名占位符
		modPlaceholder = ":m",

		// 模块内容标识占位符
		conPlaceholder = ":v",

		// 模块内容缓存key
		directionKey, 


		//////////////////////////////////////////////////
		/// 请求url处理相关
		///

		// 完整请求url初始化
		complateUrl, 
		hasSeparator,


		// 临时保存刷新前的title
		currentTitle = document.title,

		// 上一页面的路径
		lastPath,

		_state = [];

	// 判断传入的url的类型，如果是string，是普通的参数传递，即只更新一个模块的数据； 如果是array，它包括一个或多个模块更新的数据
	if ( type ( url ) === "string" ) {

		// 统一为modules数组
		modules = [ { url : url, entity : module, data : data } ];
	}
	else {
		modules = url;
	}
	
	// 循环modules，依次更新模块
	foreach ( modules, ( moduleItem, i ) => {

		moduleName 		= attr ( moduleItem.entity, single.aModule );
		directionKey 	= moduleName + "_" + moduleItem.url;
		complateUrl 	= config.params.urlRule;

		aCache 			= attr ( moduleItem.entity, single.aCache );
		isCache 		= aCache === "true" || ( config.params.redirectCache === true && aCache !== "false" );
		isBase 			= attr ( moduleItem.entity, single.aBase ) !== "false" && config.params.base.url.length > 0;

		// isCache=true、cache已有当前模块的缓存时，才使用缓存
		// 根据不同的codeKey来刷新不同模块也一定需要重新请求，不能做缓存（后续添加）
		if ( moduleItem.isCache === true && ( historyMod = cache.getRedirect ( directionKey ) ) ) {

			html ( moduleItem.entity, historyMod );
		}
		else {

			// 通过url规则转换url，并通过ice-base来判断是否添加base路径
			complateUrl 	= replaceAll ( complateUrl || "", modPlaceholder, moduleName );
			complateUrl 	= replaceAll ( complateUrl || "", conPlaceholder, moduleItem.url );


			hasSeparator 	= complateUrl.indexOf ( "/" );
			complateUrl 	= isBase ? config.params.base.url +  ( hasSeparator === 0 ? complateUrl.substr( 1 ) : complateUrl )
							  :
							  hasSeparator === 0 ? complateUrl : "/" + complateUrl;
							  
			// 请求模块跳转页面数据
			http.request ( {

				url 		: complateUrl, 
				data 		: moduleItem.data || "",
				method 		: /^(GET|POST)$/i.test ( method ) ? method.toUpperCase () : "GET",
				timeout 	: timeout || 0,
				beforeSend 	: function () {
					before ( moduleItem );
				},
				abort: function () {
					abort ( moduleItem );
				},

			} ).done ( ( moduleStr, status, xhr ) => {
            	// 解析请求module
            	// ...
				compiler = moduleCompile ( moduleStr );
            	if ( isPlainObject ( moduleItem.entity ) ) {
                	moduleItem.entity = moduleItem.entity [ xhr.getResponseHeader ( "code" ) ];
            	}
				/////////////////////////////////////////////////////////
				// 将请求的html替换到module模块中
				html ( moduleItem.entity, html );

				/////////////////////////////////////////////////////////
				// 如果需要缓存，则将html缓存起来
				//
				moduleItem.isCache === true && cache.addRedirect ( directionKey, html );

				if ( compiler.title ) {
                	document.title = compiler.title;
				}

				// 调用success回调
				success ( moduleItem );
			} ).fail ( error => {
            	error ( module, error );
			} );

		}


		// 先保存上一页面的path用于上一页面的状态保存，再将模块的当前路径更新为刷新后的url
		lastPath = getCurrentPath$ ( moduleItem.entity );
		setCurrentPath$ ( moduleItem.entity, moduleItem.url );

		_state.push ( {
			url 		: lastPath,
			moduleName 	: moduleName,
			data 		: moduleItem.data,
			title 		: i === "0" ? currentTitle : undefined
		} );

		if ( pushStack === true ) {
			single.setModuleRecord ( moduleName, moduleItem.url, true );
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
extend ( single, singleAttr, clsProperty, requestHandler );