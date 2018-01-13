import { foreach, type, noop } from "../../func/util";
import configuration from "../../core/configuration/core";
import { HASH, BROWSER } from "./historyMode";
import hashHistory from "./hashHistory";
import browserHistory from "./browserHistory";


export default {
	
	history : null,

	initHistory ( historyMode ) {
    	if ( !this.history ) {

    		this.history = 
    		( historyMode === HASH
    		? hashHistory
        	: historyMode === BROWSER
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
		http://amaple.org/######
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
		http://amaple.org/######
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
		http://amaple.org/######
	*/
	push ( state, url ) {
    	if ( this.history ) {
			this.history.push ( state, url );
		}
	},

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
		this.history.saveState ( state, pathname );
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
		return this.history.getState ( pathname );
	}
};