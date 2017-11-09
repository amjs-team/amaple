import event from "../../../event/core";
import { attr } from "../../../func/node";

export default {
	name : "on",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
	before () {
        const 
            exprMatch = this.expr.match ( /^(.*?):(.*)$/ ),
            argMatch = exprMatch [ 2 ].match ( /([$\w]+)\s*\((.*?)\)/ ),
            listener = argMatch ? argMatch [ 1 ] : exprMatch [ 2 ],
        	arg = argMatch && argMatch [ 2 ] ? argMatch [ 2 ].split ( "," ).map ( item => item.trim () ) : [],
            event = "__$event__";
      

        this.type = exprMatch [ 1 ];
    	this.attrExpr = "on" + this.type;
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
        this.node.bindEvent ( this.type, listener );
    }
};