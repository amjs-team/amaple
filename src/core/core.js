import configuration from "./configuration/core";
import cache from "../cache/core";
import single from "../single/core";
import iceHistory from "../single/iceHistory";
import { AUTO, HASH_HISTORY, BROWSER_HISTORY } from "../single/historyMode";
import event from "../event/core";
import { type, foreach, noop } from "../func/util";
import { query, attr } from "../func/node";
import { matchFnArgs } from "../func/private";
import check from "../check";
import correctParam from "../correctParam";
import Module from "./Module";
import Router from "../router/core";
import Structure from "./Tmpl/Structure";


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
	AUTO,

	// 强制使用hash模式
	HASH_HISTORY,

	// 强制使用html5 history API模式
	// 使用此模式时需注意：在不支持新特新的浏览器中是不能正常使用的
	BROWSER_HISTORY,
		
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

    	// 执行routes配置路由
    	( routerConfig.routes || noop ) ( new Router ( Router.routeTree ) );
		
    	routerConfig.history = routerConfig.history || AUTO;
    	if ( routerConfig.history === AUTO ) {
        	if ( iceHistory.supportNewApi () ) {
                routerConfig.history = BROWSER_HISTORY;
            }
            else {
                routerConfig.history = HASH_HISTORY;
            }
        }
    	
    	iceHistory.initHistory ( routerConfig.history );
    	
    	// 将baseURL、module配置信息进行保存
    	configuration ( {
    		baseURL : routerConfig.baseURL,
    		module : routerConfig.module
    	} );
    	
    	// 当使用hash模式时纠正路径
    	const 
        	location = window.location,
        	href = location.href,
            host = location.protocol + "//" + location.host + "/";
		
    	if ( routerConfig.history === HASH && href !== host && href.indexOf ( host + "#" ) === -1 ) {
        	if ( location.hash ) {
        		location.hash = "";
            }
            
            location.replace ( href.replace ( host, host + "#/" ) );
        }
    	
    	let path, search;
    	if ( routerConfig.history === HASH ) {
        	path = ( location.hash.match ( /#([^?]+)/ ) || [] ) [ 1 ];
        	search = ( location.hash.match ( /?(.*)$/ ) || [] ) [ 1 ];
        }
    	else if ( routerConfig.history === BROWSER_HISTORY ) {
        	path = location.pathname;
        	search = location.search.substr ( 1 );
        }
    	
    	// Router.matchRoutes()匹配当前路径需要更新的模块
    	// Tmpl.render()渲染对应模块
    	const location = {
        	path,
        	nextStructure : Router.matchRoutes ( this.path, this.param ),
        	param : {},
        	search : Router.matchSearch ( search ),
        	action : "NONE"
        };
        
    	// 更新currentPage结构体对象，如果为空表示页面刚刷新，将nextStructure直接赋值给currentPage
    	if ( Structure.currentPage ) {
    		Structure.currentPage.update ( location.nextStructure );
        }
    	else {
        	Structure.currentPage = location.nextStructure;
        }
    	
    	// 根据更新后的页面结构体渲染新视图
    	Structure.currentPage.render ( location );
    },

	install ( pluginDefiniton ) {
    	
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