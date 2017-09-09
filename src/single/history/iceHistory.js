import { foreach, type, noop } from "../../func/util";
import configuration from "../../core/configuration/core";
import { HASH_HISTORY, BROWSER_HISTORY } from "./historyMode";
import hashHistory from "./hashHistory";
import browserHistory from "./browserHistory";


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