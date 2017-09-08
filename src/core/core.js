import { type, foreach, noop, isEmpty } from "../func/util";
import { query, attr } from "../func/node";
import { getHashPathname, getHashSearch } from "../func/private";
import configuration from "./configuration/core";
import cache from "../cache/core";
import single from "../single/core";
import iceHistory from "../single/history/iceHistory";
import { AUTO, HASH_HISTORY, BROWSER_HISTORY } from "../single/history/historyMode";
import event from "../event/core";
import check from "../check";
import correctParam from "../correctParam";
import Module from "./Module";
import Router from "../router/core";
import Structure from "./Tmpl/Structure";


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
        	href = window.location.href,
			host = window.location.protocol + "//" + window.location.host + "/";
		
    	if ( routerConfig.history === HASH && href !== host && href.indexOf ( host + "#" ) === -1 ) {
        	if ( window.location.hash ) {
        		window.location.hash = "";
            }
            
            window.location.replace ( href.replace ( host, host + "#/" ) );
        }
    	
    	let path, search;
    	if ( routerConfig.history === HASH ) {
        	path = getHashPathname ( window.location.hash );
        	search = getHashSearch ( window.location.hash );
        }
    	else if ( routerConfig.history === BROWSER_HISTORY ) {
        	path = window.location.pathname;
        	search = window.location.search.substr ( 1 );
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

 	/**
		install ( pluginDefinition: Object )
		
		Return Type:
		void
		
		Description:
		安装插件
		插件定义对象必须拥有build方法
		若插件安装后会返回一个对象，则可在模块或组件的生命周期钩子函数中直接使用插件名引入，框架会自动注入对应插件
		
		URL doc:
		http://icejs.org/######
	*/
	install ( pluginDefiniton ) {
		check ( pluginDefiniton.name ).type ( "string" ).notBe ( "" ).check ( cache.hasPlugin ( pluginDefiniton.name ) ).be ( true ).ifNot ( "pluginDefiniton.name", "plugin安装对象必须定义name属性以表示此插件的名称，且不能与已有插件名称重复" ).do ();
    	check ( pluginDefiniton.build ).type ( "function" ).ifNot ( "pluginDefiniton.build", "plugin安装对象必须包含build方法" ).do ();
    	
    	const depNames = matchFnArgs ( pluginDefiniton.build );
    	let deps = [];
    	if ( !isEmpty ( depNames ) ) {
    		foreach ( depNames, name => {
    			deps.push ( cache.getPlugin ( name ) );
    		} );
    	}

        cache.pushPlugin ( pluginDefiniton.name, pluginDefiniton.build.apply ( this, deps ) );
	}
};