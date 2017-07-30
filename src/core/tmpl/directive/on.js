import event from "../../../event/core";

export default {

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
        let rarg = /([$\w]+)\s*\((.*?)\)/,
            expr = this.expr.split ( ":" ),
            argMatch = rarg.exec ( expr [ 1 ] );

        this.type = expr [ 0 ];
        this.expr = argMatch ? argMatch [ 1 ] : expr [ 1 ];
        this.arg = argMatch ? argMatch [ 1 ].split ( "," ).map ( item => item.trim () ) : undefined;
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