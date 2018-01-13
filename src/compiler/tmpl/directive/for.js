import { foreach, guid, noop, type } from "../../../func/util";
import { walkVDOM } from "../../../func/private";
import { directiveErr } from "../../../error";
import Tmpl from "../core";
import VTextNode from "../../../core/vnode/VTextNode";
import VFragment from "../../../core/vnode/VFragment";

function createVNode ( watcher, arg, index ) {
    const 
        f = VFragment (),
        elem = watcher.node,
        // 为itemNode指定新的key值
        key = guid (),

        // 定义范围变量
        scopedDefinition = {};

    if ( watcher.index ) {
        scopedDefinition [ watcher.index ] = index;
    }
    scopedDefinition [ watcher.item ] = arg;

    // 原始元素没有引用实际dom时传入null，表示克隆vnode不引用任何实际dom
    let itemNode = elem.clone ( false ),
        scopedAuxiliary = Tmpl.defineScoped ( scopedDefinition, itemNode ),
        nextSibClone;

    itemNode.key = key;
    
    if ( elem.conditionElems ) {
        const conditionElems = [ itemNode ];
        itemNode.conditionElems = conditionElems;
        foreach ( elem.conditionElems, ( nextSib, i ) => {
            if ( i > 0 ) {
                nextSibClone = nextSib.clone ( false );
                nextSibClone.key = key;
                nextSibClone.conditionElems = conditionElems;
                nextSibClone.scoped = itemNode.scoped;

                conditionElems.push ( nextSibClone );
            }
        } );
        itemNode.conditions = elem.conditions;
    }

    // 再外套一层fragment的原因是在if中处理时不会因为无法获取itemNode.parentNode而报错
    f.appendChild ( itemNode );

    // 为遍历克隆的元素挂载数据
    watcher.tmpl.mount ( f, true, scopedAuxiliary );
    itemNode = f.children [ 0 ];

    return itemNode;
}

/**
    unmountWatchers ( vnode: Object, isWatchCond: Boolean )

    Return Type:
    void

    Description:
    卸载对应node的watcher

    URL doc:
    http://amaple.org/######
*/
function unmountWatchers ( vnode, isWatchCond ) {

    // 移除vnode对应的watcher引用
    foreach ( vnode.watcherUnmounts || [], unmountFunc => {
        unmountFunc ();
    } );

    // 被“:if”绑定的元素有些不在vdom树上，需通过此方法解除绑定
    if ( vnode.conditionElems && isWatchCond !== false ) {
        const conditionElems = vnode.conditionElems;
        foreach ( conditionElems, conditionElem => {
            if ( conditionElem !== vnode ) {
                walkVDOM ( conditionElem, ( condSubElem, isWatchCond ) => {
                    unmountWatchers ( condSubElem, isWatchCond );
                }, false );
            }
        } );
    }
}

export default {
	name : "for",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
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
        this.startNode.key = guid ();

        this.endNode   = VTextNode ( "" );
        this.endNode.key = guid ();
    },

    /**
        update ( iterator: Array )
    
        Return Type:
        void
    
        Description:
        “:for”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://amaple.org/######
    */
	update ( iterator ) {

		const
        	elem = this.node,
            fragment = VFragment ();
      
        let itemNode, f;

        // 如果迭代变量为number或string时需将它转换为array
        if ( type ( iterator ) === "number" ) {
            const num = iterator;
            iterator = [];
            for ( let i = 0; i < num; i++ ) {
                iterator.push ( i );
            }
        }
        else if ( type ( iterator ) === "string" ) {
            iterator = iterator.split ( "" );
        }
    	
        // 初始化视图时将模板元素替换为挂载后元素
        if ( elem.parent ) {
            fragment.appendChild ( this.startNode );

            const nodeMap = [];
            foreach ( iterator, ( val, i ) => {
            	itemNode = createVNode ( this, val, i );
            	nodeMap.push ( itemNode );
            	
                fragment.appendChild ( itemNode );
            	
            } );

            fragment.appendChild ( this.endNode );
            elem.parent.replaceChild ( fragment, elem );

            // 创建数组的映射vnodes map
            Object.defineProperty ( iterator, "nodeMap", { value : nodeMap, writable : true, configurable : true, enumeratable : false } );
        }
    	else {

            // 改变数据后更新视图
        	foreach ( iterator.nodeMap, ( val, index ) => {
                let itemNode;

                // 在映射数组中找到对应项时，使用该项的key创建vnode
            	if ( val.nodeType ) {
                    itemNode = val;

                    // 当if和for指令同时使用在一个元素上，且在改变数组重新遍历前改变过if的条件时
                    // nodeMap中的元素非显示的元素，需遍历conditionElems获取当前显示的元素
                    if ( itemNode.conditionElems && !itemNode.parent ) {
                        foreach ( itemNode.conditionElems.concat ( itemNode.conditionElems [ 0 ].replacement ), conditionElem => {
                            if ( conditionElem.parent ) {
                                itemNode = conditionElem;
                            }
                        } );
                    }

                    // 更新局部监听数据
                    // 有index时更新index值
                    if ( this.index ) {
                        const rindex = new RegExp ( this.index + "$" );
                        foreach ( itemNode.scoped, ( val, key, scoped ) => {
                            if ( rindex.test ( key ) && val !== index ) {
                                scoped [ key ] = index;
                            }
                        } );
                    }
                }
                else {
                    itemNode = createVNode ( this, val, index, {} );
                    iterator.nodeMap.splice ( index, 1, itemNode );
                }

    			fragment.appendChild ( itemNode );
            } );
			
        	let p = this.startNode.parent,
         		el, isWatchCond;
        	while ( ( el = this.startNode.nextSibling () ) !== this.endNode ) {
        		p.removeChild ( el );

                // 遍历vdom并卸载node绑定的watchers
                walkVDOM ( el.isComponent ? VFragment ( el.templateNodes ) : el, ( vnode, isWatchCond ) => {
                    unmountWatchers ( vnode, isWatchCond );
                } );
            }
        	
        	p.insertBefore ( fragment, this.endNode );
        }
    }
};