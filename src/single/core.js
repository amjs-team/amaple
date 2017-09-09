import { type, foreach, noop } from "../func/util";
import { attr, html, scriptEval } from "../func/node";
import { envErr, moduleErr } from "../error";
import { MODULE_UPDATE, MODULE_REQUEST, MODULE_RESPONSE } from "../var/const";
import compileModule from "./compileModule";
import iceAttr from "./iceAttr";
import configuration from "../core/configuration/core";
import ice from "../core/core";
import cache from "../cache/core";
import http from "../http/core";
import event from "../event/core";

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
function updateModule ( moduleUpdates, moduleError, state ) {
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
}

/**
	single ( url: String|Object, moduleNode: DMOObject, param?: Object, data?: String|Object, method?:String, timeout?: Number, before?: Function, success?: Function, error?: Function, abort?: Function )

	Return Type:
	void

	Description:
	根据path请求跳转模块数据并更新对应的moduleNode（moduleNode为模块节点）

	URL doc:
	http://icejs.org/######
*/
export default function single ( path, moduleNode, param, data, method, timeout, before = noop, success = noop, error = noop, abort = noop ) {

	let historyMod,
        
        moduleUpdates = [],
        moduleError,

		_state = [];


	// 更新模块
	const 
		moduleName = attr ( moduleNode, iceAttr.module ),
		isCache = attr ( moduleNode, iceAttr.cache ),
		moduleConfig = configuration.getConfigure ( "module" ),
        
        baseURL = configuration.getConfigure ( "baseURL" ),
        isBase = attr ( moduleElem, iceAttr.base ) !== "false" && baseURL.length > 0,
		hasSeparator = url.indexOf ( "/" ),
		path = isBase 
				? baseURL + ( hasSeparator === 0 ? path.substr ( 1 ) : path )
				: path,
		,
        pathAnchor = document.createElement ( "a" );
	pathAnchor.href = path;
	path = pathAnchor.pathname;

	// 模块强制缓存或者全局使用缓存并且模块没有强制不使用缓存
	// 并且请求不为post
	// 并且已有缓存
	// 并且缓存未过期
	// cache已有当前模块的缓存时，才使用缓存
	if (
		( isCache === "true" || moduleConfig.cache === true && isCache !== "false" )
		&& ( !method || method.toUpperCase () !== "POST" )
		&& ( historyMod = cache.getModule ( path ) )
		&& ( moduleConfig.expired === 0 || historyMod.time + moduleConfig.expired > Date.now () )
	) {
        moduleUpdates.push ( () => {
        	let fragment = document.createDocumentFragment ();
			foreach ( historyMod.vm.view, childView => {
				fragment.appendChild ( childView );
    		} );
    	
			html ( moduleNode, fragment );
			event.emit ( moduleNode, MODULE_UPDATE );

			return {
				index : i,
				title : historyMod.title
			};
        } );
	}
	else {
    	
    	// 触发请求事件回调
    	event.emit ( moduleElem, MODULE_REQUEST );
						  
		// 请求模块跳转页面数据
		http.request ( {

			url 		: path,
			method 		: /^(GET|POST)$/i.test ( method ) ? method.toUpperCase () : "GET",
        	data 		: data,
			timeout 	: timeout || 0,
			beforeSend 	: () => {
				before ( moduleNode );
			},
			abort		: () => {
				abort ( moduleNode );
			},
        	complete 	: () => {
            		updateModule ( moduleUpdates, moduleError, _state );
            }
		} ).done ( moduleString => {

			/////////////////////////////////////////////////////////
        	// 编译module为可执行函数
			// 将请求的html替换到module模块中
            const updateFn = compileModule ( moduleString );
        	
        	moduleUpdates.push ( () => {
            	event.emit ( moduleNode, MODULE_RESPONSE );
        		let title = updateFn ( ice, moduleNode, html, scriptEval, cache, path );
            	event.emit ( moduleNode, MODULE_UPDATE );

            	// 调用success回调
				success ( moduleNode );

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
        	
        	error ( moduleNode, error );
		} );
	}
	
	// 如果没有ajax模块则直接更新模块
	if ( lastAjaxUpdateIndex === undefined ) {
    	updateModule ( moduleUpdates, moduleError, _state );
    }
}