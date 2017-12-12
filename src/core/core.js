import { type, foreach, noop, isEmpty } from "../func/util";
import { query, attr } from "../func/node";
import configuration from "./configuration/core";
import cache from "../cache/core";
import requestEventHandler from "../single/requestEventHandler";
import iceAttr from "../single/iceAttr";
import iceHistory from "../single/history/iceHistory";
import { AUTO, HASH, BROWSER } from "../single/history/historyMode";
import { TYPE_PLUGIN } from "../var/const";
import require from "../require/core";
import event from "../event/core";
import check from "../check";
import correctParam from "../correctParam";
import Module from "./Module";
import Component from "./component/core";
import Class from "../Class";
import Router from "../router/core";
import Structure from "./tmpl/Structure";


/////////////////////////////////
export default {

	// 路由模式，启动路由时可进行模式配置
	// 默认为自动选择路由模式，即在支持html5 history API时使用新特性，不支持的情况下自动回退到hash模式
	AUTO,

	// 强制使用hash模式
	HASH,

	// 强制使用html5 history API模式
	// 使用此模式时需注意：在不支持新特新的浏览器中是不能正常使用的
	BROWSER,
	
	// Module对象
	Module,

	// Component对象
	Component,

	// Class类构造器
	// 用于创建组件类
	class : Class,
	
	/**
		start ( routerConfig: Object )
		
		Return Type:
		void
		
		Description:
		启动ice路由
		表示启动单页模式
		
		URL doc:
		http://icejs.org/######
	*/
	startRouter ( routerConfig ) {
		check ( routerConfig ).type ( "object" ).ifNot ( "ice.startRouter", "当routerConfig传入参数时，必须为object类型" ).do ();

    	// 执行routes配置路由
    	( routerConfig.routes || noop ) ( new Router ( Router.routeTree ) );
    	delete routerConfig.routes;
		
    	routerConfig.history = routerConfig.history || AUTO;
    	if ( routerConfig.history === AUTO ) {
        	if ( iceHistory.supportNewApi () ) {
                routerConfig.history = BROWSER;
            }
            else {
                routerConfig.history = HASH;
            }
        }
    	
    	iceHistory.initHistory ( routerConfig.history );
    	
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
        delete routerConfig.history;

        // 绑定元素请求或提交表单的事件到body元素上
        event.on ( document.body, "click submit", ( e ) => {

        	const
	        	target = e.target,
	       		path = attr ( target, e.type.toLowerCase () === "submit" ? iceAttr.action : iceAttr.href );

	        if ( path && !/#/.test ( path ) ) {

	        	const 
	        		method = e.type.toLowerCase () === "submit" ? attr ( target, "method" ).toUpperCase () : "GET",
	        		buildedPath = iceHistory.history.buildURL ( path );

	        	if ( window.location.host === buildedPath.host ) {
	        		if ( buildedPath.pathname === window.location.pathname && buildedPath.search === window.location.search ) {

	        			e.preventDefault ();
	        		}
	        		else if ( requestEventHandler ( 
	        				buildedPath, 
	        				method, 
	        				method.toLowerCase () === "post" ? target : {} 
	        			) !== false ) {
	        			e.preventDefault ();
	        		}
	        	}
	        }
        } );

        const 
        	plugin = routerConfig.plugin,
        	loadPlugins = [];

        // 将除routes、history、plugin外的配置信息进行处理保存
        delete routerConfig.plugin;
    	configuration ( routerConfig );

    	const pluginBaseURL = configuration.getConfigure ( "baseURL" ).plugin;
    	
    	// 初始化插件列表
    	if ( type ( plugin ) === "array" ) {
    		foreach ( plugin, pluginItem => {
    			if ( type ( pluginItem ) === "string" ) {
    				loadPlugins.push ( pluginBaseURL + pluginItem );
    			}
    			else {
    				this.install ( pluginItem );
    			}
    		} );
    	}

    	// 如果存在需加载的插件则待插件加载完成后再执行模块更新操作
    	require ( loadPlugins, () => {
	    	const 
	    		param = {},
	    		path = iceHistory.history.getPathname (),
	    		
	    		location = {
		        	path,
		        	nextStructure : Router.matchRoutes ( path, param ),
		        	param,
		        	get : iceHistory.history.getQuery (),
		        	post : {},
		        	method : "GET",
		        	action : "NONE"
		        };

	    	// Router.matchRoutes()匹配当前路径需要更新的模块
			// 因路由刚启动，故将nextStructure直接赋值给currentPage
	    	Structure.currentPage = location.nextStructure;

	    	// 根据更新后的页面结构体渲染新视图
	    	Structure.currentPage.render ( location, location.nextStructure.copy () );
    	}, TYPE_PLUGIN );
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
	install ( pluginDefinition ) {
		check ( pluginDefinition.name )
			.type ( "string" )
			.notBe ( "" )
			.check ( cache.hasPlugin ( pluginDefinition.name ) )
			.be ( false )
			.ifNot ( "pluginDefinition.name", "plugin安装对象必须定义name属性以表示此插件的名称，且不能与已有插件名称重复" )
			.do ();

    	check ( pluginDefinition.build )
    		.type ( "function" )
    		.ifNot ( "pluginDefinition.build", "plugin安装对象必须包含build方法" )
    		.do ();
    	
    	
    	const deps = cache.getDependentPlugin ( pluginDefinition.build );
        cache.pushPlugin ( pluginDefinition.name, pluginDefinition.build.apply ( this, deps ) );
	}
};