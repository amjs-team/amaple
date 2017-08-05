import { attr } from "../../../func/node";
import { foreach } from "../../../func/util";

export default {
	name : "if",

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
        attr ( elem, ":if", null );
		
    	this.expr = "[" + elem.conditions.join ( "," ) + "]";
    	this.currentElem = elem;
        this.parent = elem.parentNode;
    	this.replacement = elem.ownerDocument.createTextNode ( "" );
      
    	foreach ( this.conditionElem, nextSib => {
        	new Tmpl ( nextSib ).mount ( this.vm, this.scoped );
        } );
    },

    /**
        update ( conditions: Array )
    
        Return Type:
        void
    
        Description:
        “:if”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
	update ( conditions ) {
		let elem = this.node,
            conditionElem = elem.conditionElem,
            newElem;

        foreach ( conditions, ( cond, i ) => {
        	if ( cond ) {
            	newElem = conditionElem [ i ];
            	return false;
            }
        } );
      
    	newElem = newElem || this.replacement;
    
    	if ( !newElem.parentNode ) {
        	this.parent.replaceChild ( newElem, this.currentElem );
        	
        	this.currentElem = newElem;
        }
    }
};