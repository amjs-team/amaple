import { foreach, guid } from "../../../func/util";
import { attr } from "../../../func/node";
import Tmpl from "../Tmpl";
import VTextNode from "../../vnode/VTextNode";
import VFragment from "../../vnode/VFragment";

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
    	
    	const
        	variable   = this.expr.match ( /^\s*([$\w]+)\s+in\s+([$\w.]+)\s*$/ );
  
		this.startNode = VTextNode ( "", guid (), null );
		this.endNode   = VTextNode ( "", guid (), null );
		
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
        	elem 		 = this.node,
            fragment     = VFragment();
      
        let itemNode, f,

            // 局部变量定义
            scopedDefinition = {};
  		
        foreach ( iterator, ( item, key ) => {
        	f = VFragment ();

            // 定义范围变量
            scopedDefinition [ this.item ] = item;
            if ( this.key ) {
                scopedDefinition [ this.key ] = key;
            }

            itemNode = elem.clone ();
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
        	this.tmpl.mount ( f, true, Tmpl.defineScoped ( scopedDefinition ) );

            itemNode = f.children [ 0 ];
            if ( itemNode.nodeName && itemNode.nodeName === "TEMPLATE" ) {
                fragment.appendChild ( VFragment ( itemNode.children ) );
            }
            else {
                fragment.appendChild ( f );
            }
        } );
    	
      	// 初始化视图时将模板元素替换为挂载后元素
    	if ( elem.parent ) {
        	fragment.insertBefore ( this.startNode, fragment.children [ 0 ] );
        	fragment.appendChild ( this.endNode );
          
            elem.parent.replaceChild ( fragment, elem );
        }
    	
    	// 改变数据后更新视图
    	else {
        	let el = this.startNode,
                p = el.parent,
                removes = [];
        	while ( ( el = el.nextSibling () ) !== this.endNode ) {
            	removes.push ( el );
            }
        	removes.map ( item => {
            	p.removeChild ( item );
            } );
        	
        	p.insertBefore ( fragment, this.endNode );
        }
    }
} );