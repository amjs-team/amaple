import { foreach, type, noop } from "../../func/util";
import { query } from "../../func/node";
import { getPathname } from "../../func/private";
import configuration from "../../core/configuration/core";
import { HASH_HISTORY, BROWSER_HISTORY } from "./historyMode";
import browserHistory from "./browserHistory";

/**
	buildURL ( url: String, newPath: String )
		
	Return Type:
	String
    构建完成后的新url
		
	Description:
	使用原完整url和新相对path构建新路径
    构建规则与普通跳转的构建相同，当新path以“/”开头时则从原url的根目录开始替换，当新path不以“/”老头时，以原url最后一个“/”开始替换		
	URL doc:
	http://icejs.org/######
*/
function buildURL ( url, newPath ) {
	return href.replace ( newPath.substr ( 0, 1 ) === "/" ? /#(.*)$/ : /(?:\/)([^\/]*)?$/, ( match, rep ) => {
		return match.replace ( rep, "" ) + newPath;
	} );
}

export default {
	
	init () {
    	event.on ( window, "hashchange", e => {

    	   	// Tmpl.render()渲染对应模块
    	   	const location = {
    	       	path : getHashPathname ( window.location.hash ),
    	       	nextStructure : this.getState (),
    	       	// param : {},
    	       	// search : Router.matchSearch ( search ),
    	       	action : "POP"
			};
    	       
    	   	// 更新currentPage结构体对象，如果为空表示页面刚刷新，将nextStructure直接赋值给currentPage
    		Structure.currentPage.update ( location.nextStructure );
    	   	
    	   	// 根据更新后的页面结构体渲染新视图
    	   	Structure.currentPage.render ( location );
        } );
    	
    	return this;
    },

	/**
		replace ( state: Object, url: String )
		
		Return Type:
		void
		
		Description:
		对history.replaceState方法的封装
		
		URL doc:
		http://icejs.org/######
	*/
	replace ( state, url ) {
		const rhash = /#.*$/;
		let href = window.location.href;
	  
		if ( !rhash.test ( href ) ) {
			href += "#/";
		}
		
		href = buildURL ( href, url );
		window.location.replace ( href );
		
		this.saveState ( getPathname (), state );
	},

	/**
		push ( state: Object, url: String )
		
		Return Type:
		void
		
		Description:
		对history.pushState方法的封装
		
		URL doc:
		http://icejs.org/######
	*/
	push ( state, title, url ) {
		let hash = window.location.hash;
		hash = buildURL ( hash || "#/", url );
		window.location.hash = hash;
		
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
	}
};