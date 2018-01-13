import { directiveErr } from "../../../error";

export default {
	name : "cache",
	
	// static为true时，模板将不会挂载watcher在对应vm下
	static : true,
    
    before () {
        if ( !/^true|false$/.test ( this.expr ) ) {
            throw directiveErr ( "cache", "cache指令的值只能为'true'或'false'，表示是否缓存此模块内容" );
        }
    },

    /**
        update ( isCache: String )
    
        Return Type:
        void
    
        Description:
        将:cache存入vnode中
        此时的isCache参数将会在getter方法中转换为实际的boolean值
    
        URL doc:
        http://amaple.org/######
    */
	update ( isCache ) {
    	this.node.cache = isCache === "true" ? true : false;
    }
};