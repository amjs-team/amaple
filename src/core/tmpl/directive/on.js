import event from "../../../event/core";
import { attr } from "../../../func/node";

export default {
	name : /^on/,

    /**
        before ()
    
        Return Type:
        void|Boolean
        返回false时停止往下执行
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
	before () {
        let expr = this.expr.split ( ":" ),
            argMatch = /([$\w]+)\s*\((.*?)\)/.exec ( expr [ 1 ] ),
            listener = argMatch ? argMatch [ 1 ] : expr [ 1 ],
        	arg = argMatch && argMatch [ 2 ] ? argMatch [ 2 ].split ( "," ).map ( item => item.trim () ) : [],
            event = "__$event__";
      

        this.type = expr [ 0 ];
    	attr ( this.node, ":on" + this.type, null );
        arg.unshift ( event );
    
    	this.expr = `function ( ${ event } ) {
            self.addScoped ();
			${ listener }.call ( this, ${ arg.join ( "," ) } );
            self.removeScoped ();
		}`;
    },

    /**
        update ( listener: Function )
    
        Return Type:
        void
    
        Description:
        事件绑定方法
    
        URL doc:
        http://icejs.org/######
    */
	update ( listener ) {
        event.on ( this.node, this.type, listener );
    }
};