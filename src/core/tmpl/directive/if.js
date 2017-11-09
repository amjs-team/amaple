import { attr } from "../../../func/node";
import { foreach, type, guid } from "../../../func/util";
import slice from "../../../var/slice";
import VTextNode from "../../vnode/VTextNode";
import VFragment from "../../vnode/VFragment";

export default {
	name : "if",

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
		const elem = this.node;
		
    	this.expr = "[" + elem.conditions.join ( "," ) + "]";
    	this.replacement = VTextNode ( "" );
        this.replacement.conditionElems = elem.conditionElems;

        // 如果有key表示此元素为循环遍历元素，需为占位元素设置相同key
        // 且循环遍历的元素一定有局部变量，也需将此赋予
        if ( elem.key && elem.scoped ) {
            this.replacement.key = elem.key;
            this.replacement.scoped = elem.scoped;
            elem.replacement = this.replacement;
        }

        // 将elem在DOM结构中去掉，以便在下面循环扫描时不会扫描到elem的nextSibling元素
        elem.parent.replaceChild ( this.replacement, elem );
        this.currentNode = this.replacement;
      
    	foreach ( elem.conditionElems, nextSib => {
            if ( nextSib !== elem ) {
                this.tmpl.mount ( nextSib, true, this.scoped );
            }
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

		const 
            elem = this.node,
            conditionElems = elem.conditionElems,
            cNode = this.currentNode,
            parent = cNode.parent;

        let newNode, _cNode;

        foreach ( conditions, ( cond, i ) => {
        	if ( cond ) {
                newNode = conditionElems [ i ];
            	return false;
            }
        } );
        
        // 当新节点为空时表示没有找到符合条件的节点，则不显示任何节点（即显示replacement空文本节点）
        if ( !newNode ) {
            newNode = this.replacement;
            _cNode = newNode;
        }
        else {
            _cNode = newNode;
        }
    
    	if ( newNode && !newNode.parent ) {
            parent.replaceChild ( newNode, cNode );

            this.currentNode = _cNode;
        }
    }
};