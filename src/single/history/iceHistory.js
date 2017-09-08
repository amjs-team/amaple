import { foreach, type, noop } from "../../func/util";
import configuration from "../../core/configuration/core";
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

    		this.history = 
    		( historyMode === HASH_HISTORY
    		? hashHistory
        	: historyMode === BROWSER_HISTORY
        		? browserHistory
    			: { init : noop } ).init ();
        }
    },

    /**
		supportNewApi ()
		
		Return Type:
		Boolean
		是否支持history新特性
		
		Description:
		检查是否支持history新特性
		
		URL doc:
		http://icejs.org/######
	*/
	supportNewApi () {
		return !!window.history.pushState;
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
		if ( this.history ) {
			this.history.replace ( state, url );
		}
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
	push ( state, url ) {
    	if ( this.history ) {
			this.history.push ( state, url );
		}
	}
};