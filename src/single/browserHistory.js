import { envErr } from "../error";
import event,from "../event/core";

export default {
	
	// window.history对象
	entity : window.history,
	
	init () {
    	event.on ( "popstate", e => {
        	
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
		if ( this.supportNewApi () ) {
			this.entity.replaceState ( state, null, url );
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
		http://icejs.org/######
	*/
	push ( state, url ) {
    	if ( this.supportNewApi () ) {
			this.entity.pushState ( state, null, url );
        }
    	else {
        	throw envErr ( "history API", "浏览器不支持history新特性，您可以选择AUTO模式或HASH_BROWSER模式" );
        }
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
	}
};