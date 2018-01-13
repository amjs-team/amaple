import { newClassCheck } from "../../Class";
import { extend, foreach, type, guid } from "../../func/util";
import { attr } from "../../func/node";
import { attrAssignmentHook } from "../../var/const";
import { vnodeErr } from "../../error";
import correctParam from "../../correctParam";
import event from "../../event/core";
import slice from "../../var/slice";
import { getInsertIndex, diffAttrs, diffEvents, diffChildren } from "./diffs";
import VElement from "./VElement";
import VTextNode from "./VTextNode";
import VFragment from "./VFragment";
import NodePatcher from "./NodePatcher";

/**
    supportCheck ( nodeType: Number, method: String )

    Return Type:
    void

    Description:
    检查vnode的类型是否支持调用某成员方法
    nodeType为1或11时才能操作子节点

    URL doc:
    http://amaple.org/######
*/
function supportCheck ( nodeType, method ) {
	if ( nodeType !== 1 && nodeType !== 11 ) {
    	throw vnodeErr ( "NotSupport", `此类型的虚拟节点不支持${ method }方法` );
    }
}


/**
    updateParent ( childVNode: Object, parent: Object )

    Return Type:
    void

    Description:
    更换父节点
    如果此子节点已有父节点则将此子节点从父节点中移除

    URL doc:
    http://amaple.org/######
*/
export function updateParent ( childVNode, parent ) {
    if ( childVNode && parent && childVNode.parent !== parent ) {

        // 如果有父节点，则从父节点中移除
        if ( childVNode.parent ) {
            childVNode.parent.removeChild ( childVNode );
        }

        childVNode.parent = parent;
    }
}

/**
    VNode ( nodeType: Number, parent: Object, node: DOMObject )

    Return Type:
    void

    Description:
    虚拟DOM类

    URL doc:
    http://amaple.org/######
*/
export default function VNode ( nodeType, parent, node ) {
	newClassCheck ( this, VNode );
	
	this.nodeType = nodeType;
    this.node = node;

	this.parent = parent || null;
    if ( 
        this.parent instanceof VNode 
        && this.parent.children
        && this.parent.children.indexOf ( this ) === -1 
    ) {
        this.parent.push ( this );
    }
}

extend ( VNode.prototype, {

    /**
        appendChild ( childVNode: Object )
    
        Return Type:
        void
    
        Description:
        在此vnode的children末尾添加一个子vnode
    
        URL doc:
        http://amaple.org/######
    */
	appendChild ( childVNode ) {
    	supportCheck ( this.nodeType, "appendChild" );
    	
        let children;
    	if ( childVNode.nodeType === 11 ) {
            children = childVNode.children.concat ();
        	foreach ( childVNode.children, child => {
            	this.children.push ( child );
            } );
        }
    	else {
            children = [ childVNode ];
    		this.children.push ( childVNode );
        }

        // 更换父节点
        foreach ( children, child => {
            updateParent ( child, this );
        } );
    },
	
    /**
        removeChild ( childVNode: Object )
    
        Return Type:
        void
    
        Description:
        在此vnode下移除一个子vnode
    
        URL doc:
        http://amaple.org/######
    */
	removeChild ( childVNode ) {
    	supportCheck ( this.nodeType, "removeChild" );

        if ( childVNode.parent === this ) {
            this.children.splice ( this.children.indexOf ( childVNode ), 1 );
            childVNode.parent = null;
        }
    },

    replaceChild ( newVNode, oldVNode ) {
    	supportCheck ( this.nodeType, "replaceChild" );
    	
    	const i = this.children.indexOf ( oldVNode );
    	if ( i >= 0 ) {
            let children;
        	if ( newVNode.nodeType === 11 ) {
                children = newVNode.children.concat ();

            	Array.prototype.splice.apply ( this.children, [ i, 1 ].concat ( children ) );
            }
        	else {
                children = [ newVNode ];
        		this.children.splice ( i, 1, newVNode );
            }

            // 更换父节点
            foreach ( children, child => {
                updateParent ( child, this );
            } );

            oldVNode.parent = null;
        }
    },
	
    /**
        insertBefore ( newVNode: Object, existingVNode: Object )
    
        Return Type:
        void
    
        Description:
        在existingVNode前插入一个vnode
    
        URL doc:
        http://amaple.org/######
    */
	insertBefore ( newVNode, existingVNode ) {
    	supportCheck ( this.nodeType, "insertBefore" );
    	
    	const i = this.children.indexOf ( existingVNode );
    	if ( i >= 0 ) {
            let children;
        	if ( newVNode.nodeType === 11 ) {
                children = newVNode.children.concat ();
            	Array.prototype.splice.apply ( this.children, [ i, 0 ].concat ( newVNode.children ) );
            }
        	else {
                children = [ newVNode ];
        		this.children.splice ( i, 0, newVNode );
            }

            // 更换父节点
            foreach ( children, child => {
                updateParent ( child, this );
            } );
    	}
    },
    
    /**
        html ( vnode: Object )
    
        Return Type:
        void
    
        Description:
        将此vnode下的内容替换为vnode
    
        URL doc:
        http://amaple.org/######
    */
    html ( vnode ) {
    	supportCheck ( this.nodeType, "html" );

        this.clear ();
        this.appendChild ( vnode );
    },

    /**
        clear ()
    
        Return Type:
        void
    
        Description:
        清空子元素
    
        URL doc:
        http://amaple.org/######
    */
    clear () {
        foreach ( this.children, child => {
            child.parent = null;
        } );

        this.children = [];
    },
	
	/**
        nextSibling ()
    
        Return Type:
        void
    
        Description:
        获取此vnode的下一个vnode
    
        URL doc:
        http://amaple.org/######
    */
	nextSibling () {
    	if ( this.parent ) {
        	return this.parent.children [ this.parent.children.indexOf ( this ) + 1 ];
        }
    },

    /**
        nextElementSibling ()
    
        Return Type:
        void
    
        Description:
        获取此vnode的下一个element vnode
    
        URL doc:
        http://amaple.org/######
    */
    nextElementSibling () {
        if ( this.parent ) {
            let index = this.parent.children.indexOf ( this ) + 1,
                nextElem = this.parent.children [ index ];

            while ( nextElem && nextElem.nodeType !== 1 ) {
                nextElem = this.parent.children [ ++index ];
            }
            
            return nextElem;
        }
    },

    /**
        prevSibling ()
    
        Return Type:
        void
    
        Description:
        获取此vnode的下一个vnode
    
        URL doc:
        http://amaple.org/######
    */
    prevSibling () {
        if ( this.parent ) {
            return this.parent.children [ this.parent.children.indexOf ( this ) - 1 ];
        }
    },

    /**
        attr ( name: String, val: Object|String|null )

        Return Type:
        void

        Description:
        获取、设置（单个或批量）、移除vnode属性

        URL doc:
        http://amaple.org/######
    */
    attr ( name, val ) {
    	supportCheck ( this.nodeType, "attr" );
    	correctParam ( name, val ).to ( "string", [ "string", "object", null, "boolean" ] ).done ( function () {
			name = this.$1;
			val = this.$2;
		} );

        const tval = type ( val );
        if ( tval === "undefined" ) {
            return this.attrs [ name ];
        }
        else if ( tval === "null" ) {
            delete this.attrs [ name ];
        }
        else if ( tval === "object" ) {
            foreach ( val, ( v, k ) => {
                this.attrs [ k ] = v;
            } );
        }
        else {
            this.attrs [ name ] = val;
        }
    },

    /**
        render ()
    
        Return Type:
        DOMObject
        此vnode对应的实际DOM
    
        Description:
        将此vnode渲染为实际DOM
    
        URL doc:
        http://amaple.org/######
    */
    render () {
    	
        let f;
    	switch ( this.nodeType ) {
        	case 1:
        		if ( !this.node ) {
                    if ( this.templateNodes ) {
                        this.node = [];
                        foreach ( this.templateNodes, vnode => {
                            this.node.push ( vnode.render () );
                        } );
                    }
                    else {
            			this.node = document.createElement ( this.nodeName );
        				foreach ( this.attrs, ( attrVal, name ) => {
                            if ( attrAssignmentHook.indexOf ( name ) === -1 ) {
                                attr ( this.node, name, attrVal );
                            }
                            else {
                                this.node [ name ] = attrVal;
                            }
                        } );
                        foreach ( this.events, ( handlers, type ) => {
                            foreach ( handlers, handler => {
                                event.on ( this.node, type, handler );
                            } );
                        } );
                    }
         		}
                else {

                    // vnode为组件或template时，node为一个数组，代表了此组件的模板元素
                    // 此时不需要修正属性
                    if ( this.templateNodes ) {
                        this.node = [];
                        foreach ( this.templateNodes, vnode => {
                            this.node.push ( vnode.render () );
                        } );
                    }
                    else {

                        // 存在对应node时修正node属性
                        foreach ( this.attrs, ( attrVal, name ) => {
                            if ( attrAssignmentHook.indexOf ( name ) === -1 ) {
                                attr ( this.node, name, attrVal );
                            }
                            else {
                                this.node [ name ] = attrVal;
                            }
                        } );

                        // 移除不存在的属性
                        foreach ( slice.call ( this.node.attributes ), attrNode => {
                            if ( !Object.prototype.hasOwnProperty.call ( this.attrs, attrNode.name ) ) {
                                attr ( this.node, attrNode.name, null );
                            }
                        } );

                        foreach ( this.events, ( handlers, type ) => {
                            foreach ( handlers, handler => {
                                event.on ( this.node, type, handler );
                            } );
                        } );
                    }
                }
            	
                if ( this.children.length > 0 && !this.templateNodes ) {

                    // 先清除子节点再重新添加
                    while ( this.node.firstChild ) {
                        this.node.removeChild ( this.node.firstChild );
                    }

                    f = document.createDocumentFragment ();
                    foreach ( this.children, child => {
                        f.appendChild ( child.render () );
                    } );
                    
                    this.node.appendChild ( f );
                }
            	
            	break;
        	case 3:
            	if ( !this.node ) {
        			this.node = document.createTextNode ( this.nodeValue || "" );
                }
                else {
                    if ( this.node.nodeValue !== this.nodeValue ) {
                        this.node.nodeValue = this.nodeValue;
                    }
                }
            	
            	break;
        	case 11:
            	if ( !this.node ) {
        			this.node = document.createDocumentFragment ();
                }
        		
            	f = document.createDocumentFragment ();
        		foreach ( this.children, child => {
        			f.appendChild ( child.render () );
        		} );
            	
            	this.node.appendChild ( f );

                break;
        }
    	
        if ( type ( this.node ) === "array" ) {
            f = document.createDocumentFragment ();
            foreach ( this.node, node => {
                f.appendChild ( node );
            } );

            return f;
        }

    	return this.node;
    },

    /**
        clone ( isQuoteDOM: Boolean )
    
        Return Type:
        Object
        此vnode的克隆vnode
    
        Description:
        克隆此vnode
        操作克隆的vnode不会影响此vnode
        如果参数isQuoteDOM为false时，则此vnode不会引用任何node
    
        URL doc:
        http://amaple.org/######
    */
    clone ( isQuoteDOM ) {
        let vnode, 
            node = isQuoteDOM === false ? null : this.node;

        switch ( this.nodeType ) {
        	case 1:

        		// 复制attrs
    			const attrs = {};
    			foreach ( this.attrs, ( attr, name ) => {
        			attrs [ name ] = attr;
        		} );

                vnode = VElement ( this.nodeName, attrs, null, null, node, this.isComponent );
                vnode.key = this.key;

                if ( this.events ) {
                    foreach ( this.events, ( handlers, type ) => {
                        foreach ( handlers, handler => {
                            vnode.bindEvent ( type, handler );
                        } );
                    } );
                }

                if ( this.templateNodes ) {
                    if ( vnode.isComponent ) {
                        vnode.component = this.component;
                    }

                    vnode.templateNodes = [];
                    foreach ( this.templateNodes, ( templateNode, i ) => {
                        vnode.templateNodes.push ( templateNode.clone () );
                    } );
                }
            	
            	break;
        	case 3:
            	vnode = VTextNode ( this.nodeValue, null, node );
                vnode.key = this.key;
            	
            	break;
        	case 11:
            	vnode = VFragment ( null, node );
        }

        if ( this.children ) {
            foreach ( this.children, ( child, i ) => {
                vnode.appendChild ( child.clone ( isQuoteDOM ) );
            } );
        }
    	
    	return vnode;
    },
    
    /**
        bindEvent ( type: String, listener: Function )
    
        Return Type:
        void
    
        Description:
        为此vnode绑定事件
    
        URL doc:
        http://amaple.org/######
    */
    bindEvent ( type, listener ) {
    	this.events = this.events || {};
    	this.events [ type ] = this.events [ type ] || [];
    	
    	this.events [ type ].push ( listener );
    },

    /**
        diff ( oldVNode: Object )
    
        Return Type:
        Object
        此vnode与参数oldVNode对比后计算出的NodePatcher对象
    
        Description:
        此vnode与参数oldVNode进行对比，并计算出差异
    
        URL doc:
        http://amaple.org/######
    */
    diff ( oldVNode ) {
        const nodePatcher = new NodePatcher ();

        if ( !oldVNode ) {
            nodePatcher.addNode ( this, getInsertIndex ( this.parent.children.indexOf ( this ), this.parent.children ) );
        }
    	else if ( this.nodeType === 3 && oldVNode.nodeType === 3 ) {
            
            // 防止使用”:if“、”:else-if“指令时相同元素导致无法匹配元素的问题
            if ( this.node !== oldVNode.node ) {
                this.node = oldVNode.node;
            }
        	if ( this.nodeValue !== oldVNode.nodeValue ) {
            	
            	// 文本节点内容不同时更新文本内容
                nodePatcher.replaceTextNode ( this, oldVNode );
            }
        }
    	else if ( this.nodeName === oldVNode.nodeName && this.key === oldVNode.key ) {

            // 如果当前为组件或template vnode，则处理templateNodes
			if ( this.templateNodes ) {

                // 还未挂载的组件或template是没有templateNodes的
                // 此时需将该templateNodes替换为组件内容
                if ( !oldVNode.templateNodes ) {
                    nodePatcher.replaceNode ( VFragment ( this.templateNodes ), oldVNode );
                }
                else {
                    diffChildren ( this.templateNodes, oldVNode.templateNodes, nodePatcher );
                }
            }
        	else {

                // 防止使用”:if“、”:else-if“指令时相同元素导致无法匹配元素的问题
                if ( this.node !== oldVNode.node ) {
                    this.node = oldVNode.node;
                }
            	
            	// 通过key对比出节点相同时
            	// 对比属性
        		diffAttrs ( this, oldVNode, nodePatcher );

                // 对比事件
                diffEvents ( this, oldVNode, nodePatcher );

                // 比较子节点
                diffChildren ( this.children, oldVNode.children, nodePatcher );
            }
        }
		else {
        	
        	// 节点不同，直接替换
            nodePatcher.replaceNode ( this, oldVNode );
        }

        return nodePatcher;
    },

    /**
        emit ( type: String )
    
        Return Type:
        void
    
        Description:
        触发事件
    
        URL doc:
        http://amaple.org/######
    */
    emit ( type ) {
        if ( this.node ) {
            event.emit ( this.node, type );
        }
    },
} );

extend ( VNode, {

    /**
        domToVNode ( dom: DOMObject|DOMString, parent: Object )
    
        Return Type:
        Object
        实际DOM转换后的vnode对象
    
        Description:
        将实际DOM或DOM String转换为vnode对象
    
        URL doc:
        http://amaple.org/######
    */
	domToVNode ( dom ) {
    	if ( type ( dom ) === "string" ) {
        	const 
            	d = document.createElement ( "div" ),
                f = document.createDocumentFragment ();
        	
        	d.innerHTML = dom;
        	foreach ( slice.call ( d.childNodes ), childNode => {
            	f.appendChild ( childNode );
            } );
        	
        	dom = f;
        }
    	
        let vnode;
        switch ( dom.nodeType ) {
            case 1:
                const attrs = {};
                foreach ( slice.call ( dom.attributes ), attr => {
                    attrs [ attr.name ] = attr.nodeValue;
                } );

                vnode = VElement ( dom.nodeName, attrs, null, null, dom );

                break;
            case 3:
                vnode = VTextNode ( dom.nodeValue, null, dom );

                break;
            case 11:
                vnode = VFragment ( null, dom );
        }

        foreach ( slice.call ( dom.nodeName === "TEMPLATE" ? dom.content.childNodes || dom.childNodes : dom.childNodes ), child => {

            child = VNode.domToVNode ( child );
            if ( child instanceof VNode ) {
                vnode.appendChild ( child );
            }
        } );
    	
    	return vnode;
    }
} );