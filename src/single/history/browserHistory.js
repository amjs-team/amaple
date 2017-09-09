import { envErr } from "../../error";
import event from "../../event/core";
import Structure from "../../core/tmpl/Structure";

export default {
	
	// window.history对象
	entity : window.history,
	
	init () {
    	event.on ( window, "popstate", e => {
    	       
    		// 更新currentPage结构体对象，如果为空表示页面刚刷新，将nextStructure直接赋值给currentPage
    		Structure.currentPage.update ( this.getState () );
    	   	
    	   	// 根据更新后的页面结构体渲染新视图
    	   	Structure.currentPage.render ( {
            	// param : {},
    	       	// search : Router.matchSearch ( search ),
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
		if ( this.entity.pushState ) {
			this.entity.replaceState ( null, null, url );
			this.saveState ( window.location.pathname, state );
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
    	if ( this.entity.pushState ) {
			this.entity.pushState ( null, null, url );
			this.saveState ( window.location.pathname, state );
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
		setState ( pathname: String, state: Any )
		
		Return Type:
		void
		
		Description:
		保存状态记录
		
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
		return this.states [ pathname || window.location.pathname ];
	}
};