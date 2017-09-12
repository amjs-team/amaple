import { foreach, type, noop } from "../../func/util";
import { query } from "../../func/node";
import { getPathname, buildURL } from "../../func/private";
import configuration from "../../core/configuration/core";
import { HASH_HISTORY, BROWSER_HISTORY } from "./historyMode";
import browserHistory from "./browserHistory";

export default {
	
	init () {
    	event.on ( window, "hashchange", e => {
        	
        	// 如果this.pushOrRepalce为true表示为跳转触发
        	if ( this.pushOrReplace === true ) {
            	this,pushOrReplace = false;
            	return;
            }
        	
    	    const locationGuide = this.getState ();
        	
    	   	// 更新currentPage结构体对象，如果为空表示页面刚刷新，将nextStructure直接赋值给currentPage
    		Structure.currentPage.update ( locationGuide.structure );
    	   	
    	   	// 根据更新后的页面结构体渲染新视图
    	   	Structure.currentPage.render ( {
            	param : locationGuide.param,
            	search : locationGuide.search,
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
		http://icejs.org/######
	*/
	replace ( state, url ) {
		this.pushOrReplace = true;

		const hashPathname = buildURL ( url, "hash" );
		window.location.replace ( hashPathname );

		this.saveState ( getPathname (), state );
	},

	/**
		push ( state: Any, url: String )
		
		Return Type:
		void
		
		Description:
		对history.pushState方法的封装
		
		URL doc:
		http://icejs.org/######
	*/
	push ( state, title, url ) {
    	this.pushOrReplace = true;

		const hashPathname = buildURL ( url, "hash" );
		window.location.hash = hashPathname;

		this.saveState ( getPathname (), state );
	},

	////////////////////////////////////
	/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
	/// 
	states : {},

	/**
		setState ( pathname: String, state: Any )
		
		Return Type:
		void
		
		Description:
		保存pathname下的状态
		
		URL doc:
		http://icejs.org/######
	*/
	saveState ( pathname, state ) {
		this.states [ pathname ] = state;
	},

	/**
		getState ( pathname?: String )
		
		Return Type:
		Object
		
		Description:
		获取对应记录
		
		URL doc:
		http://icejs.org/######
	*/
	getState ( pathname ) {
		return this.states [ pathname || getPathname () ];
	},
	
	/**
		buildURL ( path: String, mode: String )
		
		Return Type:
		String
    	构建完成后的新url
		
		Description:
		使用path与hash pathname构建新的pathname
        mode为true时不返回hash的开头“#”
        
    	构建规则与普通跳转的构建相同，当新path以“/”开头时则从原url的根目录开始替换，当新path不以“/”老头时，以原url最后一个“/”开始替换

		URL doc:
		http://icejs.org/######
	*/
	buildURL ( path, mode ) {
		let pathname = ( window.location.hash || "#/" ).replace ( path.substr ( 0, 1 ) === "/" ? /#(.*)$/ : /(?:\/)([^\/]*)?$/, ( match, rep ) => {
			return match.replace ( rep, "" ) + path;
		} );
    
    	return mode === true ? pathname.substr ( 0, 1 ) : pathname;
	},
	
	/**
		getPathname ()

		Return Type:
		String
		pathname

		Description:
		获取pathname

		URL doc:
		http://icejs.org/######
	*/
	getPathname () {
    	return ( window.location.hash.match ( /#([^?]*)$/ ) || [ "", "" ] ) [ 1 ];
    }
};