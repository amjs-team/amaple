import { rexpr } from "../../../var/const";
import { attr } from "../../../func/node";

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
        this.expr = "\"" + this.expr + "\"";

        // 将表达式转换为字符串拼接代码
    	this.expr = this.expr.replace ( rexpr, ( match, rep ) => "\" + " + rep + " + \"" );
    },

    /**
        update ( val: String )
    
        Return Type:
        void
    
        Description:
        “{{ express }}”表达式对应的视图更新方法
        该表达式可用于标签属性与文本中
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
	update ( val ) {
        this.node.nodeValue = val;
    }
};