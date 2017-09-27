import { type, foreach, noop, isEmpty } from "../func/util";
import { query, attr } from "../func/node";
import configuration from "./configuration/core";
import cache from "../cache/core";
import requestEventHandler from "../single/requestEventHandler";
import iceAttr from "../single/iceAttr";
import iceHistory from "../single/history/iceHistory";
import { AUTO, HASH_HISTORY, BROWSER_HISTORY } from "../single/history/historyMode";
import event from "../event/core";
import check from "../check";
import correctParam from "../correctParam";
import Module from "./Module";
import Router from "../router/core";
import Structure from "./tmpl/Structure";


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
	startRouter ( routerConfig = {} ) {

		// 纠正参数
		// correctParam ( rootModuleName, routerConfig ).to ( "string", "object" ).done ( function () {
		// 	this.$1 = rootModuleName;
		// 	this.$2 = routerConfig;
		// } );

		// if ( rootModuleName !== undefined ) {
		// 	check ( rootModuleName ).type ( "string" ).notBe ( "" ).ifNot ( "ice.startRouter", "当rootModuleName传入参数时，必须是不为空的字符串" ).do ();
		// }

		check ( routerConfig ).type ( "object" ).ifNot ( "ice.startRouter", "当routerConfig传入参数时，必须为object类型" ).do ();

    	// 执行routes配置路由
    	( routerConfig.routes || noop ) ( new Router ( Router.routeTree ) );
    	delete routerConfig.routes;
		
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
    	
    	// 当使用hash模式时纠正路径
    	const 
        	href = window.location.href,
			host = window.location.protocol + "//" + window.location.host + "/";
		
    	if ( routerConfig.history === HASH_HISTORY && href !== host && href.indexOf ( host + "#" ) === -1 ) {
        	if ( window.location.hash ) {
        		window.location.hash = "";
            }
            
            window.location.replace ( href.replace ( host, host + "#/" ) );
        }

        delete routerConfig.history;
    	
    	// 将除routes、history外的配置信息进行保存
    	configuration ( routerConfig );

        // 绑定元素请求或提交表单的事件到body元素上
        event.on ( document.body, "click submit", ( e ) => {

        	const
	        	target = e.target,
	       		path = attr ( target, e.type.toLowerCase () === "submit" ? iceAttr.action : iceAttr.href ),
	        	method = e.type.toLowerCase () === "submit" ? attr ( target, "method" ).toUpperCase () : "GET";

	        if ( path ) {
	        	e.preventDefault ();

	        	requestEventHandler ( iceHistory.history.buildURL ( path ), method, method.toLowerCase () === "post" ? target : {} );
	        }
        } );
    	

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
    	Structure.currentPage = location.nextStructure.copy ();

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
		check ( pluginDefiniton.name )
			.type ( "string" )
			.notBe ( "" )
			.check ( cache.hasPlugin ( pluginDefiniton.name ) )
			.be ( true )
			.ifNot ( "pluginDefiniton.name", "plugin安装对象必须定义name属性以表示此插件的名称，且不能与已有插件名称重复" )
			.do ();

    	check ( pluginDefiniton.build )
    		.type ( "function" )
    		.ifNot ( "pluginDefiniton.build", "plugin安装对象必须包含build方法" )
    		.do ();
    	
    	
    	const deps = cache.getDependentPlugin ( pluginDefiniton.build );
    	
        cache.pushPlugin ( pluginDefiniton.name, pluginDefiniton.build.apply ( this, deps ) );
	}
};