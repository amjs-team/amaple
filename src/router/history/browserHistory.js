import { envErr } from "../../error";
import event from "../../event/core";
import Structure from "../Structure";
import Router from "../Router";

export default {
	
	// window.history对象
	entity : window.history,
	
	init () {
    	event.on ( window, "popstate", e => {
    	    let locationGuide = this.getState ();

    	    if ( !locationGuide ) {
	    	    const 
	    	    	path = window.location.pathname,
	    	    	param = {},
	    			structure = Router.matchRoutes ( path, param );

	    		locationGuide = {
	    			structure,
	    			param,
	    			get : window.location.search,
	    			post : {}
	    		};

	    		this.saveState ( locationGuide, path );
    	    }

    	    // 复制一份结构对象用于更新当前结构
    	    // 因为更新当前结构时会改变用于更新的结构对象
    	    const nextStructure = locationGuide.structure.copy ();

    	    // 更新currentPage结构体对象
    	    // 并根据更新后的页面结构体渲染新视图
    		Structure.currentPage
    		.update ( nextStructure )
			.render ( {
    			nextStructure,
            	param : locationGuide.param,
    	       	get : locationGuide.get,
    	       	post : locationGuide.post,
    	       	action : "POP"
            } );
        } );
    	
    	return this;
    },
	
	/**
		replace ( state: Any, url: String )
		
		Return Type:
		void
		
		Description:
		对history.replaceState方法的封装
		
		URL doc:
		http://amaple.org/######
	*/
	replace ( state, url ) {
		if ( this.entity.pushState ) {
			this.entity.replaceState ( null, null, url );
			this.saveState ( state, window.location.pathname );
        }
    	else {
        	throw envErr ( "history API", "浏览器不支持history新特性，您可以选择AUTO模式或HASH_BROWSER模式" );
        }
    },
    
    /**
		push ( state: Any, url: String )
		
		Return Type:
		void
		
		Description:
		对history.pushState方法的封装
		
		URL doc:
		http://amaple.org/######
	*/
	push ( state, url ) {
    	if ( this.entity.pushState ) {
			this.entity.pushState ( null, null, url );
			this.saveState ( state, window.location.pathname );
        }
    	else {
        	throw envErr ( "history API", "浏览器不支持history新特性，您可以选择AUTO模式或HASH_BROWSER模式" );
        }
	},

	////////////////////////////////////
	/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
	/// 
	states : {},

	/**
		setState ( state: Any, pathname: String )
		
		Return Type:
		void
		
		Description:
		保存状态记录
		
		URL doc:
		http://amaple.org/######
	*/
	saveState ( state, pathname ) {
		this.states [ pathname ] = state;
	},

	/**
		getState ( pathname?: String )
		
		Return Type:
		Object
		
		Description:
		获取对应记录
		
		URL doc:
		http://amaple.org/######
	*/
	getState ( pathname ) {
		return this.states [ pathname || window.location.pathname ];
	},
	
	/**
		buildURL ( path: String, mode: String )
		
		Return Type:
		String
    	构建完成后的新url
		
		Description:
		使用path与当前pathname构建新的pathname
        mode为true时不返回hash的开头“#”
        
    	构建规则与普通跳转的构建相同，当新path以“/”开头时则从原url的根目录开始替换，当新path不以“/”老头时，以原url最后一个“/”开始替换

		URL doc:
		http://amaple.org/######
	*/
	buildURL ( path ) {
    	const pathAnchor = document.createElement ( "a" );
		pathAnchor.href = path;
		
		return {

			// IE下给a.href赋值为相对路径时，a.host为空，赋值为全域名路径时能获取值
			host : pathAnchor.host || window.location.host,

			// IE下的a标签的pathname属性开头没有"/"
			pathname : ( pathAnchor.pathname.substr ( 0, 1 ) === "/" ? "" : "/" ) + pathAnchor.pathname,
			search : pathAnchor.search 
		};
	},
  
	/**
	getPathname ()

	Return Type:
	String
	pathname

	Description:
	获取pathname

	URL doc:
	http://amaple.org/######
*/
	getPathname () {
		return window.location.pathname;
	},

	/**
    	getQuery ( path?: String )

    	Return Type:
    	String
    	get请求参数对象

    	Description:
		获取get请求参数

    	URL doc:
    	http://amaple.org/######
    */
	getQuery ( path ) {
		return path && ( path.match ( /\?(.*)$/ ) || [ "" ] ) [ 0 ] || window.location.search;
    }
};