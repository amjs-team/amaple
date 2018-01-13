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
        http://amaple.org/######
    */
	before () {
        const 
            rfncall = /^\s*([$\w]+)(?:\s*\((.*?)\))?\s*$/,
            exprMatch = this.expr.match ( /^(.*?):(.*)$/ ),
            event = "__$event__";

        let listener = exprMatch [ 2 ];
        if ( rfncall.test ( listener ) ) {
            const
                argMatch = listener.match ( rfncall ),
                arg = argMatch && argMatch [ 2 ] ? argMatch [ 2 ].split ( "," ).map ( item => item.trim () ) : [];

            arg.unshift ( event );
            listener = `${ argMatch ? argMatch [ 1 ] : listener }(${ arg.join ( "," ) })`;
        }
        
        this.type = exprMatch [ 1 ];
    	this.attrExpr = "on" + this.type;
    	this.expr = `function ( ${ event } ) {
            self.addScoped ();
			${ listener };
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
        http://amaple.org/######
    */
	update ( listener ) {
        this.node.bindEvent ( this.type, listener );
    }
};