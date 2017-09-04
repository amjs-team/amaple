import configuration from "./configuration/core";
import cache from "../cache/core";
import single from "../single/core";
import event from "../event/core";
import { type, foreach, noop } from "../func/util";
import { query, attr } from "../func/node";
import { matchFnArgs } from "../func/private";
import check from "../check";
import correctParam from "../correctParam";
import Module from "./Module";
import Router from "../router/core";


/////////////////////////////////

/**
	filterDeps ( deps: Object, args: Array )

	Return Type:
	Object
	过滤后deps对象

	Description:
	过滤deps中未被接收的依赖项

	URL doc:
	http://icejs.org/######
*/
function filterDeps ( deps, args ) {
	let _deps = {};
	
	// 过滤多余的依赖项
	foreach ( deps, ( item, key ) => {
		if ( args.indexOf ( key ) > -1 ) {
			_deps [ key ] = item;
		}
	} );

	return _deps;
}


/////////////////////////////////
export default {

	// 路由模式，启动路由时可进行模式配置
	// 自动选择路由模式(默认)
	// 在支持html5 history API时使用新特性，不支持的情况下自动回退到hash模式
	AUTO : 0,

	// 强制使用hash模式
	HASH : 1,

	// 强制使用html5 history API模式
	// 使用此模式时需注意：在不支持新特新的浏览器中是不能正常使用的
	BROWSER_HISTORY : 2,
		
	// Module对象
	Module,
	
	/**
		start ( rootModuleName: String, routerConfig: Object )
		
		Return Type:
		void
		
		Description:
		以一个module作为起始点启动ice
		
		URL doc:
		http://icejs.org/######
	*/
	startRouter ( rootModuleName, routerConfig = {} ) {

		// 纠正参数
		correctParam ( rootModuleName, routerConfig ).to ( "string", "object" ).done ( function () {
			this.$1 = rootModuleName;
			this.$2 = routerConfig;
		} );

		if ( rootModuleName !== undefined ) {
			check ( rootModuleName ).type ( "string" ).notBe ( "" ).ifNot ( "ice.startRouter", "当rootModuleName传入参数时，必须是不为空的字符串" ).do ();
		}

		check ( routerConfig ).type ( "object" ).ifNot ( "ice.startRouter", "当routerConfig传入参数时，必须为object类型" ).do ();


    	// 将baseURL、module配置信息进行保存
    	configuration ( {
    		baseURL : routerConfig.baseURL,
    		module : routerConfig.module
    	} );

    	// 执行routes配置路由
    	( routerConfig.routes || noop ) ( new Router ( Router.routeTree ) );
		
    	routerConfig.history = routerConfig.history || this.AUTO;
    	let historyEvent;
    	switch ( routerConfig.history ) {
        	case this.AUTO :
            	if ( window.history.pushState ) {
                	historyEvent = "popstate";
                }
            	else {
                	historyEvent = "hashchange";
                }
            	break;
        	case this.HASH :
            	historyEvent = "hashchange";
            	break;
        	case this.BROWSER_HISTORY :
            	historyEvent = "popstate";
        }
    	// 根据history的值进行初始化popstate或hashchange事件
		event.on ( window, historyEvent, event => {
			let
	    // 取得在single中通过replaceState保存的state object
	    		state 			= single.history.getState ( window.location.pathname ),

	    		before 			= {},
	    		after 			= {},
	    		differentState  = {},

	    		_modules 		= [];

	    	if ( type ( state ) === "array" && state.length > 0 ) {

    			foreach ( state, item => {

    				_modules.push ( {
    					url 	: item.url, 
    					entity 	: item.module, 
    					data 	: item.data
    				} );
    			} );

	    		single ( _modules, null, null, null, null, null, null, null, null, true, true );
	    	}
	    	else {

	    		// 获得跳转前的模块信息
    			decomposeArray ( split.call ( single.history.signature, "/" ), ( key, value ) => {
    				before [ key ] = value ;
    			} );

    			// 获得跳转后的模块信息
    			decomposeArray ( split.call ( window.location.pathname, "/" ), ( key, value ) => {
    				after [ key ]  = value ;
    			} );


	    		// 对比跳转前后url所体现的变化module信息，根据这些不同的模块进行加载模块内容
	    		foreach ( after, ( afterItem, key ) => {
	    			if ( before [ key ] !== afterItem ) {
	    				differentState [ key ] = afterItem;
	    			}
	    		} );

				foreach ( before, ( afterItem, key ) => {
					if ( after [ key ] !== afterItem ) {
						differentState [ key ] = null;
					}
				} );

				// 根据对比跳转前后变化的module信息，遍历重新加载
				foreach ( differentState, ( src, moduleName ) => {
					_module = query ( `*[${ single.aModule }=${ moduleName }]` );

					src 	  = src === null ? attr ( _module, single.aSrc ) : src;

					_modules.push ( {
    					url 	: src, 
    					entity 	: _module, 
    					data 	: null
					} );
				} );

				single ( _modules, null, null, null, null, null, null, null, null, true, true );
	    	}
		} );
		
    	let location = {
        	param : {},
        	action : "NONE"
        };
    	
    	// Router.matchRoutes()匹配当前路径需要更新的模块
    	// Tmpl.render()渲染对应模块
    	location.routes = Router.matchRoutes ( window.location.pathname, location.param );
		location.search = Router.matchSearch ( window.location.search );
    	
    	Tmpl.render ( location );
    },

	install ( structure ) {
    	
		// 查看是否有deps，有的时候，value类型分为以下情况：
		// 1、若value为string，则使用cache.componentCreater方法获取插件，如果没有则使用模块加载器加载
		// 2、若value为object，则调用use构建插件
		// 判断是plugin还是driver，存入相应的cache中并返回
    	
    	check ( structure.build ).type ( "function" ).or ().check ( structure.init ).type ( "function" ).ifNot ( "plugin-driver", "plugin必须包含build方法，driver必须包含init方法" ).do ();
      
    	let deps = structure.deps || {},
            moduleType = structure.build ? TYPE_PLUGIN :TYPE_DRIVER,
            moduleInfo = Loader.getCurrentDep (),
            args;
    	
        switch ( moduleType ) {
            case TYPE_PLUGIN:
                args = matchFnArgs ( structure.build );
            	deps = filterDeps ( deps, args );
    			depend ( moduleInfo || {}, deps, ( depObject ) => {
                	cache.pushPlugin ( moduleInfo.name, structure.build.apply ( null, args.map ( arg => depObject [ arg ] ) ) );
                } );
            	
                break;
            case TYPE_DRIVER:
                args = matchFnArgs ( structure.apply ).slice ( 1 ).concat ( matchFnArgs ( structure.init ) );
            	deps = filterDeps ( deps, args );
          		cache.pushDriver ( structure );
    			depend ( Loader.TopName, deps, noop );
            	
                break;
        }
	}
};