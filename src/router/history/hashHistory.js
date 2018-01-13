import event from "../../event/core";
import Structure from "../Structure";
import Router from "../../router/core";


export default {
	
	init () {
    	event.on ( window, "hashchange", e => {
        	
        	// 如果this.pushOrRepalce为true表示为跳转触发
        	if ( this.pushOrReplace === true ) {
            	this.pushOrReplace = false;
            	return;
            }
        	
    	    let locationGuide = this.getState ();
    	    if ( !locationGuide ) {
	    	    const 
	    	    	path = this.getPathname (),
	    	    	param = {},
	    			structure = Router.matchRoutes ( path, param );

	    		locationGuide = {
	    			structure,
	    			param,
	    			get : this.getQuery (),
	    			post : {}
	    		};

	    		this.saveState ( locationGuide, path );
    	    }
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
		this.pushOrReplace = true;
		window.location.replace ( "#" + url );

		this.saveState ( state, this.getPathname () );
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
    	this.pushOrReplace = true;
		window.location.hash = `#${ url }`;

		this.saveState ( state, this.getPathname () );
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
		保存pathname下的状态
		
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
		return this.states [ pathname || this.getPathname () ];
	},
	
	/**
		buildURL ( path: String, mode: String )
		
		Return Type:
		String
    	构建完成后的新url
		
		Description:
		使用path与hash pathname构建新的pathname
        mode为true时不返回hash的开头“#”
        
    	构建规则与普通跳转的构建相同，当新path以“/”开头时则从原url的根目录开始替换，当新path不以“/”开头时，以原url最后一个“/”开始替换

		URL doc:
		http://amaple.org/######
	*/
	buildURL ( path, mode ) {
		let host = window.location.host,
			search = "";
		path = path.replace ( /\s*http(?:s)?:\/\/(.+?\/|.+)/, ( match, rep ) => {
			host = rep;
			return "";
		} )
		.replace ( /\?.*?$/, match => {
			search = match;
			return "";
		} );

		const pathname = ( window.location.hash || "#/" ).replace ( 
			path.substr ( 0, 1 ) === "/" ? /#(.*)$/ : /\/([^\/]*)$/, 
			( match, rep ) => {
				return match.replace ( rep, "" ) + path;
			} );
    
    	return {
    		host,
    		search,
    		pathname : pathname.substr ( 1 )
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
    	return ( window.location.hash.match ( /#([^?]*)/ ) || [ "", "/" ] ) [ 1 ];
    },

    /**
    	getQuery ( path?: String )

    	Return Type:
    	String
    	get请求参数

    	Description:
		获取get请求参数

    	URL doc:
    	http://amaple.org/######
    */
	getQuery ( path ) {
		return ( ( path || window.location.hash ).match ( /\?(.*)$/ ) || [ "" ] ) [ 0 ];
    }
};