import { foreach, guid } from "../../../func/util";
import { VNODE_ADD, VNODE_REMOVE, VNODE_MOVE } from "../../../var/const";
import Tmpl from "../Tmpl";
import VTextNode from "../../vnode/VTextNode";
import VFragment from "../../vnode/VFragment";

function createVNode ( arg, key, watcher ) {
    const 
        f = VFragment (),
        elem = watcher.node,
        itemNode = elem.clone (),

        // 定义范围变量
        scopedDefinition = {};

    scopedDefinition [ watcher.item ] = arg;
	itemNode.key = guid ();
    if ( watcher.key ) {
        scopedDefinition [ watcher.key ] = key;
    }
    
    if ( elem.conditionElems ) {
        itemNode.conditionElems = [ itemNode ];
        foreach ( elem.conditionElems, ( nextSib, i ) => {
            if ( i > 0 ) {
                itemNode.conditionElems.push ( nextSib.clone () );
            }
        } );
        itemNode.conditions = elem.conditions;
    }

    // 再外套一层fragment的原因是在if中处理时不会因为无法获取itemNode.parentNode而报错
    f.appendChild ( itemNode );

    // 为遍历克隆的元素挂载数据
    watcher.tmpl.mount ( f, true, Tmpl.defineScoped ( scopedDefinition ) );

    return itemNode.nodeName && itemNode.nodeName === "TEMPLATE" ? VFragment ( itemNode.children ) : itemNode;
}

Tmpl.defineDirective ( {
	name : "for",

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
    	
    	const variable   = this.expr.match ( /^\s*([$\w]+)\s+in\s+([$\w.]+)\s*$/ );
  
		this.startNode = VTextNode ( "" );
		this.endNode   = VTextNode ( "" );
		
        this.item      = variable [ 1 ];
        this.expr      = variable [ 2 ];
       	this.key       = this.node ( ":key" );
        
    	if ( this.key ) {
            this.node.attr ( ":key", null );
        }
    },

    /**
        update ( iterator: Array )
    
        Return Type:
        void
    
        Description:
        “:for”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
	update ( iterator ) {
		const
        	elem = this.node,
            fragment = VFragment (),
            nodeMap = [];
      
        let itemNode, f;
    	
        // 初始化视图时将模板元素替换为挂载后元素
        if ( elem.parent ) {
            foreach ( iterator, ( val, key ) => {
            	itemNode = createVNode ( val, key, this );
            	nodeMap.push ( {
                	node : itemNode,
                	val,
                } );
            	
                fragment.appendChild ( itemNode );
            	
            } );

            fragment.insertBefore ( this.startNode, fragment.children [ 0 ] );
            fragment.appendChild ( this.endNode );
            
            elem.parent.replaceChild ( fragment, elem );
        }
    	else {

            // 改变数据后更新视图
        	foreach ( iterator, ( val, key ) => {
        		foreach ( this.nodeMap, item => {
                	if ( item.val === val ) {
                    	itemNode = item.node;
            			nodeMap.push ( {
                        	node : itemNode,
                        	val,
                        } );
            			
            			return false;
                    }
                } );
    			
    			// 在原数组中没有找到对应项时，创建新的项
    			if ( !itemNode ) {
                	itemNode = createVNode ( val, key, this );
            		nodeMap.push ( {
                		node : itemNode,
                		val,
                	} );
                }
    			
    			fragment.appendChild ( itemNode );
            } );
			
        	let el,
         		p = el.parent;
        	while ( ( el = this.startNode.nextSibling () ) !== this.endNode ) {
        		p.removeChild ( el );
            }
        	
        	p.insertBefore ( fragment, this.endNode );
        }
        
        this.nodeMap = nodeMap;
    }
} );