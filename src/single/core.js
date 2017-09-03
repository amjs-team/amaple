import { extend, type, foreach, replaceAll, noop, isPlainObject } from "../func/util";
import { attr, html, scriptEval } from "../func/node";
import { getCurrentPath, setCurrentPath } from "../func/private";
import { envErr, moduleErr } from "../error";
import singleAttr from "./singleAttr";
import clsProperty from "./clsProperty";
import requestEventBind from "./requestEventBind";
import compileModule from "./compileModule";
import includeModule from "./includeModule";
import configuration from "../core/configuration/core";
import ice from "../core/core";
import cache from "../cache/core";
import http from "../http/core";
import event from "../event/core";

const 
	// 模块名占位符
	modPlaceholder = ":m",

	// 模块内容标识占位符
	conPlaceholder = ":v";


/**
	updateModule ( moduleUpdates: Array, errorModule: Object|undefined, titles: Array, state: Array, pushStack: Boolean, onpopstate: Boolean )

	Return Type:
	void

	Description:
	使用更新函数更新模块内容
    更新页面标题并更新url
    如果更新的模块中有错误模块信息则只更新错误模块

	URL doc:
	http://icejs.org/######
*/
function updateModule ( moduleUpdates, moduleError, state, pushStack, onpopstate ) {
	if ( moduleError ) {
    	const moduleName = Object.keys ( moduleError ) [ 0 ];
        single ( moduleError [ moduleName ], query ( `*[${ single.aModule }=${ moduleName }]` ), undefined, undefined, undefined, undefined, undefined, undefined, undefined, true, false );
    }
	else {
		let titles = [],
			titleItem, title;
    	foreach ( moduleUpdates, updateFn => {
    		titleItem = updateFn ();
    		titles [ titleItem.index ] = titleItem.title;
    	} );
    	
    	// 同时更新多个模块时，使用第一个模块的标题，如第一个模块没有标题则使用第二个模块的标题，以此类推。如所有模块都没有标题则不改变标题
    	foreach ( titles, t => {
        	if ( t ) {
        		title = t;
            	return false;
            }
        } );
    	
    	if ( title && document.title !== title ) {
    		document.title = title;
    	}
    }
	
	
	// 判断是否调用pushState
	if ( pushStack === true ) {

		// 需判断是否支持history API新特性
		if ( single.history.entity.pushState ) {

          /////////////////////////////////////////////////////////
			// 保存跳转前的页面状态
			single.history.setState ( single.history.signature, state, true );

			if ( onpopstate !== true ) {
				single.history.push ( null, null, single.getFormatModuleRecord ( configuration.getConfigure ( "moduleSeparator" ) ) );
			}

			// 初始化一条将当前页的空值到single.history.state中
			single.history.setState ( window.location.pathname, null );
			
		}
		else {
			throw envErr ( "History API", "浏览器不支持HTML5 History API" );
		}
	}
}

/**
	dataToStr ( data?: Object|String )

	Return Type:
	void

	Description:
	将请求参数转换为字符串供缓存key使用

	URL doc:
	http://icejs.org/######
*/
function dataToStr ( data ) {
	if ( type ( data ) === "string" ) {
    	let dataArr = data.split ( "&" ),
            kv;
    	data = {};
    	
    	foreach ( dataArr, item => {
        	kv = item.split ( "=" );
        	data [ kv [ 0 ].trim () ] = kv [ 1 ].trim ();
        } );
    }
	
	let keys, str = "";
	if ( type ( data ) === "object" ) {
		keys = Object.keys ( data ).sort ();
		foreach ( keys, k => {
	    	str += k + data [ k ];
	    } );
	}

	return str;
}

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
export default function single ( url, moduleElem, data, method, timeout, before = noop, success = noop, error = noop, abort = noop, pushStack = false, onpopstate = false ) {

	let moduleName, isCache, isBase, modules, historyMod,
		
        direction = configuration.getConfigure ( "direction" ),
        
		// 模块内容缓存key
		directionKey, 
		//////////////////////////////////////////////////
		/// 请求url处理相关

		// 完整请求url初始化
		fullUrl, 
		hasSeparator,

		// 上一页面的路径
		lastPath,
        
        lastAjaxUpdateIndex,
        moduleUpdates = [],
        moduleError,

		_state = [];

	// 判断传入的url的类型，如果是string，是普通的参数传递，即只更新一个模块的数据； 如果是array，它包括一个或多个模块更新的数据
	// 需统一为modules数组
	modules = type ( url ) === "string" ? [ { url : url, entity : moduleElem, data : data } ] : url;

	
	// 循环modules，依次更新模块
	foreach ( modules, ( module, i ) => {

		moduleName = attr ( module.entity, single.aModule );
		directionKey = moduleName + module.url + dataToStr ( module.data );
    	isCache = attr ( module.entity, single.aCache );

		// 模块强制缓存或者全局使用缓存并且模块没有强制不使用缓存
    	// 并且请求不为post
    	// 并且已有缓存
    	// 并且缓存未过期
    	// cache已有当前模块的缓存时，才使用缓存
		if ( ( isCache === "true" || direction.cache === true && isCache !== "false" ) && ( !method || method.toUpperCase () !== "POST" ) && ( historyMod = cache.getDirection ( directionKey ) ) && ( direction.expired === 0 || historyMod.time + direction.expired > Date.now () ) ) {

            moduleUpdates.push ( () => {
            	let fragment = document.createDocumentFragment ();
    			foreach ( historyMod.vm.view, childView => {
					fragment.appendChild ( childView );
        		} );
        	
				html ( module.entity, fragment );
    			event.emit ( module.entity, single.MODULE_UPDATE );

    			return {
    				index : i,
    				title : historyMod.title
    			};
            } );
		}
		else {
        	lastAjaxUpdateIndex = i;
        	
			isBase = attr ( module.entity, single.aBase ) !== "false" && configuration.getConfigure ( "baseUrl" ).length > 0;
        	
			fullUrl = configuration.getConfigure ( "urlRule" );

			// 通过url规则转换url，并通过ice-base来判断是否添加base路径
			fullUrl = replaceAll ( fullUrl || "", modPlaceholder, moduleName );
			fullUrl = replaceAll ( fullUrl || "", conPlaceholder, module.url );

			hasSeparator = fullUrl.indexOf ( "/" );
			fullUrl = isBase ? configuration.getConfigure ( "baseUrl" ) +  ( hasSeparator === 0 ? fullUrl.substr( 1 ) : fullUrl )
							  :
							  hasSeparator === 0 ? fullUrl : "/" + fullUrl;
        	
        	// 触发请求事件回调
        	event.emit ( module.entity, single.MODULE_REQUEST );
							  
			// 请求模块跳转页面数据
			http.request ( {

				url 		: fullUrl, 
				data 		: module.data || "",
				method 		: /^(GET|POST)$/i.test ( method ) ? method.toUpperCase () : "GET",
				timeout 	: timeout || 0,
				beforeSend 	: function () {
					before ( module );
				},
				abort		: function () {
					abort ( module );
				},
            	complete 	: function () {
                	if ( i === lastAjaxUpdateIndex ) {
                		updateModule ( moduleUpdates, moduleError, _state, pushStack, onpopstate );
                	}
                }

			} ).done ( moduleString => {
				/////////////////////////////////////////////////////////
            	// 编译module为可执行函数
				// 将请求的html替换到module模块中
                let updateFn = compileModule ( moduleString );
            	
            	moduleUpdates.push ( () => {
                	event.emit ( module.entity, single.MODULE_RESPONSE );
            		let title = updateFn ( ice, module.entity, html, scriptEval, cache, directionKey );
                	event.emit ( module.entity, single.MODULE_UPDATE );

                	// 调用success回调
					success ( module );

					return {
						index : i,
						title : title
					};
                } );
			} ).fail ( ( iceXHR, errorCode ) => {
            	const errorConfig = configuration.getConfigure ( "page" + errorCode );
            	
            	if ( type ( errorConfig ) === "object" ) {
                	moduleError = errorConfig;
                }
            	
            	error ( module, error );
			} );
		}


		// 先保存上一页面的path用于上一页面的状态保存，再将模块的当前路径更新为刷新后的url
		lastPath = getCurrentPath ( module.entity );
		setCurrentPath ( module.entity, module.url );

		_state.push ( {
			url 	: lastPath,
			module 	: module.entity,
			data 	: module.data
		} );

		if ( pushStack === true ) {
			single.setModuleRecord ( moduleName, module.url, true );
		}
	} );
	
	// 如果没有ajax模块则直接更新模块
	if ( lastAjaxUpdateIndex === undefined ) {
    	updateModule ( moduleUpdates, moduleError, _state, pushStack, onpopstate );
    }
}

//////////////////////////////////////////
// module无刷新跳转相关属性通用参数，为避免重复定义，统一挂载到single对象上
// single相关静态变量与方法
extend ( single, singleAttr, clsProperty, { requestEventBind, includeModule } );