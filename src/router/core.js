import { attr } from "../func/node";
import { type, foreach, noop } from "../func/util";
import { TYPE_PLUGIN, amAttr } from "../var/const";
import { AUTO, HASH, BROWSER } from "./history/historyMode";
import check from "../check";
import Router from "./Router";
import amHistory from "./history/core";
import event from "../event/core";
import requestEventHandler from "./requestEventHandler";
import configuration from "../core/configuration/core";
import pluginBuilder from "../core/plugin/core";
import require from "../require/core";
import Structure from "./Structure";

/**
	start ( routerConfig: Object )
	
	Return Type:
	void
	
	Description:
	启动am路由
	表示启动单页模式
	
	URL doc:
	http://amaple.org/######
*/
export default function startRouter ( routerConfig ) {
	check ( routerConfig ).type ( "object" ).ifNot ( "am.startRouter", "当routerConfig传入参数时，必须为object类型" ).do ();

	// 执行routes配置路由
	( routerConfig.routes || noop ) ( new Router ( Router.routeTree ) );
	delete routerConfig.routes;
	
	routerConfig.history = routerConfig.history || AUTO;
	if ( routerConfig.history === AUTO ) {
    	if ( amHistory.supportNewApi () ) {
            routerConfig.history = BROWSER;
        }
        else {
            routerConfig.history = HASH;
        }
    }
	
	amHistory.initHistory ( routerConfig.history );
	
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
       		path = attr ( target, e.type.toLowerCase () === "submit" ? amAttr.action : amAttr.href );

        if ( path && !/#/.test ( path ) ) {

        	const 
        		method = e.type.toLowerCase () === "submit" ? attr ( target, "method" ).toUpperCase () : "GET",
        		buildedPath = amHistory.history.buildURL ( path );

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
	
	// 初始化插件列表
	const 
		rexternalURL = /^http(?:s)?:\/\//,
		pluginBaseURL = configuration.getConfigure ( "baseURL" ).plugin,
		callbacks = {};
	if ( type ( plugin ) === "array" ) {
		foreach ( plugin, pluginItem => {
			if ( type ( pluginItem ) === "string" ) {

				// 去除请求url的首尾空格
				pluginItem = pluginItem.trim ();

				// plugin构建格式为am规范时
				pluginItem = rexternalURL.test ( pluginItem ) ? pluginItem : pluginBaseURL + pluginItem;
				loadPlugins.push ( pluginItem );
			}
			else if ( type ( pluginItem ) === "object" && type ( pluginItem.url ) === "string" ) {

				// 去除请求url的首尾空格
				pluginItem.url = pluginItem.url.trim ();

				// plugin构建格式为amd/iife规范时
				pluginItem.url = rexternalURL.test ( pluginItem.url ) ? pluginItem.url : pluginBaseURL + pluginItem.url;
				loadPlugins.push ( pluginItem.url );
			}
			
			// 此回调函数用于在iife规范下获取window对象的全局属性
			// 返回的回调函数将会在对应的script的onload函数中执行
			const callback = pluginBuilder.save ( pluginItem );
			if ( callback ) {
				callbacks [ pluginItem.url ] = callback;
			}
		} );
	}

	// 如果存在需加载的插件则待插件加载完成后再执行模块更新操作
	require ( loadPlugins, () => {

		// 插件加载完成后构建插件
		pluginBuilder.build ();

    	const 
    		param = {},
    		path = amHistory.history.getPathname (),
    		
    		location = {
	        	path,
	        	nextStructure : Router.matchRoutes ( path, param ),
	        	param,
	        	get : amHistory.history.getQuery (),
	        	post : {},
	        	method : "GET",
	        	action : "NONE"
	        };

    	// Router.matchRoutes()匹配当前路径需要更新的模块
		// 因路由刚启动，故将nextStructure直接赋值给currentPage
    	Structure.currentPage = location.nextStructure;

    	// 根据更新后的页面结构体渲染新视图
    	Structure.currentPage.render ( location, location.nextStructure.copy () );
	}, TYPE_PLUGIN, callbacks );
}