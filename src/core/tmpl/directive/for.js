import { foreach, guid } from "../../../func/util";
import { unmountWatchers } from "../../../func/private";
import { directiveErr } from "../../../error";
import { VNODE_ADD, VNODE_REMOVE, VNODE_MOVE } from "../../../var/const";
import Tmpl from "../Tmpl";
import VTextNode from "../../vnode/VTextNode";
import VFragment from "../../vnode/VFragment";

function createVNode ( watcher, arg, index, realNode, key ) {
    const 
        f = VFragment (),
        elem = watcher.node,

        // 定义范围变量
        scopedDefinition = {};

    let itemNode = elem.clone ( realNode ),
        nextSibClone;

    scopedDefinition [ watcher.item ] = arg;

    // 为itemNode指定key，如果没有传入key则生成一个新key
	key = key !== undefined ? key : guid ();
    itemNode.key = key;
    if ( watcher.index ) {
        scopedDefinition [ watcher.index ] = index;
    }
    
    if ( elem.conditionElems ) {
        itemNode.conditionElems = [ itemNode ];
        foreach ( elem.conditionElems, ( nextSib, i ) => {
            if ( i > 0 ) {
                nextSibClone = nextSib.clone ( realNode );
                nextSibClone.key = key;
                itemNode.conditionElems.push ( nextSibClone );
                nextSibClone.mainVNode = itemNode;
            }
        } );
        itemNode.conditions = elem.conditions;
    }

    // 再外套一层fragment的原因是在if中处理时不会因为无法获取itemNode.parentNode而报错
    f.appendChild ( itemNode );

    // 为遍历克隆的元素挂载数据
    watcher.tmpl.mount ( f, true, Tmpl.defineScoped ( scopedDefinition ) );
    itemNode = f.children [ 0 ];

    return itemNode;
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
    	const 
            forExpr = /^\s*([$\w(),\s]+)\s+in\s+([$\w.]+)\s*$/,
            keyExpr = /^\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\)$/;

        if ( !forExpr.test ( this.expr ) ) {
            throw directiveErr ( "for", "for指令内的循环格式为'item in list'或'(item, index) in list'，请正确使用该指令" );
        }
    	const 
            variable = this.expr.match ( forExpr ),
            indexValMatch = variable [ 1 ].match ( keyExpr );

        if ( indexValMatch ) {
            this.item = indexValMatch [ 1 ];
            this.index = indexValMatch [ 2 ];
        }
        else {
            this.item = variable [ 1 ];
        }

        this.expr      = variable [ 2 ];
        this.startNode = VTextNode ( "" );
        this.endNode   = VTextNode ( "" );
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
            fragment.appendChild ( this.startNode );
            foreach ( iterator, ( val, i ) => {
            	itemNode = createVNode ( this, val, i, null );
            	nodeMap.push ( {
                	itemNode,
                	val,
                } );
            	
                fragment.appendChild ( itemNode );
            	
            } );
            fragment.appendChild ( this.endNode );
            
            elem.parent.replaceChild ( fragment, elem );
        }
    	else {

            // 改变数据后更新视图
        	foreach ( iterator, ( val, index ) => {
                let itemNode = {};

                // 在原数组中找到对应项时，使用该项的key创建vnode
        		foreach ( this.nodeMap, item => {
                	if ( item.val === val ) {
                    	itemNode = item.itemNode;
            			return false;
                    }
                } );
                itemNode = createVNode ( this, val, index, itemNode.node || null, itemNode.key );
    			nodeMap.push ( { itemNode, val } );

    			fragment.appendChild ( itemNode );
            } );
			
        	let p = this.startNode.parent,
         		el;
        	while ( ( el = this.startNode.nextSibling () ) !== this.endNode ) {
        		p.removeChild ( el );

                // 卸载node的watchers
                unmountWatchers ( el.isComponent ? VFragment ( el.templateNodes ) : el );
            }
        	
        	p.insertBefore ( fragment, this.endNode );
        }
        
        this.nodeMap = nodeMap;
    }
} );