import event from "../../../event/event";

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
        let expr = this.expr.split ( ":" );
        this.type = expr [ 0 ];
        this.expr = expr [ 1 ];
    },

    /**
        update ( val: String )
    
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