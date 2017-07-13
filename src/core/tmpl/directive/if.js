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
    	let elem = this.node;
    	if ( attr ( elem, ":for" ) ) {
            return false;
        }
            
        attr ( elem, ":if", null );
    	this.parent = this.elem.parentNode;
    	this.replacement = this.elem.ownerDocument.createTextNode ( "" );
    },

    /**
        update ( val: Boolean )
    
        Return Type:
        void
    
        Description:
        “:if”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
	update ( val ) {
		let elem = this.node,
            parent = elem.parent;
            
        if ( val && !elem.parentNode ) {
            parent.replaceChild ( this.replacement, elem );
        }
        else if ( !val && this.elem.parentNode == parent ) {
            parent.replaceChild ( elem, replacement );
        }
    }
};