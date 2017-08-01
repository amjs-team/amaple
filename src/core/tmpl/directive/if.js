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
        this.parent = elem.parentNode;
    	this.replacement = elem.ownerDocument.createTextNode ( "" );
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
            parent = elem.parentNode;

        if ( val && !parent ) {
            this.parent.replaceChild ( elem, this.replacement );
        }
        else if ( !val && elem.parentNode === this.parent ) {
            this.parent.replaceChild ( this.replacement, elem );
        }
    }
};