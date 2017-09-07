import { foreach, type, noop } from "../func/util";
import { query } from "../func/node";
import configuration from "../core/configuration/core";
import { HASH_HISTORY, BROWSER_HISTORY } from "./historyMode";
import hashHistory from "./hashHistory";
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
	
	history : null,

	initHistory ( historyMode ) {
    	if ( !this.history ) {
    		this.history = ( historyMode === HASH_HISTORY
    		? hashHistory
        	: historyMode === BROWSER_HISTORY
        		? browserHistory
    			: { init : noop } ).init ();
        }
    }
	
	/**
		replace ( state: Object, title: String, url: String )
		
		Return Type:
		void
		
		Description:
		检查是否支持history新特性
		
		URL doc:
		http://icejs.org/######
	*/
	supportNewApi () {
		return !!this.entity.pushState;
	},

	/**
		replace ( state: Object, title: String, url: String )
		
		Return Type:
		void
		
		Description:
		对history.replaceState方法的封装
		
		URL doc:
		http://icejs.org/######
	*/
	replace ( state, title, url ) {
		if ( this.historyMode === BROWSER_HISTORY && this.supportNewApi () ) {
			this.entity.replaceState ( null, title, url );
        	url = window.location.pathname;
		}
		else if ( this.historyMode === HASH ) {
        	const rhash = /#.*$/;
        	let href = window.location.href;
          
        	if ( !rhash.test ( href ) ) {
				href += "#/";
        	}
        	
        	
        	href = buildURL ( href, url )
    		window.location.replace ( href );
        	url = ( href.match ( /#([^?]*)$/ ) || [ "", "" ] ) [ 1 ];
        }
		
		this.saveState ( url, state );
	},

	/**
		push ( state: Object, title: String, url: String )
		
		Return Type:
		void
		
		Description:
		对history.pushState方法的封装
		
		URL doc:
		http://icejs.org/######
	*/
	push ( state, title, url ) {
    	if ( this.historyMode === BROWSER_HISTORY && this.supportNewApi () ) {
			this.entity.pushState ( null, title, url );
        	url = window.location.pathname;
		}
		else if ( this.historyMode === HASH ) {
        	let hash = window.location.hash;
        	hash = buildURL ( hash || "#/", url );
        	window.location.hash = hash;
        	url = ( href.match ( /#([^?]*)$/ ) || [ "", "" ] ) [ 1 ];
        }
		
		this.saveState ( url, state )
	},

	/**
		getOriginalState ()
		
		Return Type:
		Object
		
		Description:
		获取参数传递对象
		
		URL doc:
		http://icejs.org/######
	*/
	getOriginalState () {
		return this.entity.state;
	},

		////////////////////////////////////
	/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
	/// 
	state : {},

	/**
		setState ( key: String, value: Object )
		
		Return Type:
		void
		
		Description:
		保存状态记录
		先查找key对应的记录，找到时更新此记录,未找到时添加一条记录
		
		URL doc:
		http://icejs.org/######
	*/
	saveState ( key, value, mode ) {
		this.state [ key ] = value;
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
		return this.state [ pathname || window.location,pathname ];
	}
};