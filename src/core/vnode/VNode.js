import { newClassCheck } from "../../Class";
import { extend, foreach, type, guid } from "../../func/util";
import { attr } from "../../func/node";
import { vnodeErr } from "../../error";
import correctParam from "../../correctParam";
import event from "../../event/core";
import slice from "../../var/slice";
import { diffAttrs, diffChildren } from "./diffs";
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
    http://icejs.org/######
*/
function supportCheck ( nodeType, method ) {
	if ( nodeType !== 1 && nodeType !== 11 ) {
    	throw vnodeErr ( "NotSupport", `此类型的虚拟节点不支持${ method }方法` );
    }
}


/**
    changeParent ( childVNode: Object, parent: Object )

    Return Type:
    void

    Description:
    更换父节点
    如果此子节点已有父节点则将此子节点从父节点中移除

    URL doc:
    http://icejs.org/######
*/
export function changeParent ( childVNode, parent ) {
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
    http://icejs.org/######
*/
export default function VNode ( nodeType, parent, node ) {
	newClassCheck ( this, VNode );
	
	this.nodeType = nodeType;
	this.parent = parent || null;
	this.node = node;
}

extend ( VNode.prototype, {

    /**
        appendChild ( childVNode: Object )
    
        Return Type:
        void
    
        Description:
        在此vnode的children末尾添加一个子vnode
    
        URL doc:
        http://icejs.org/######
    */
	appendChild ( childVNode ) {
    	supportCheck ( this.nodeType, "appendChild" );

        changeParent ( childVNode, this );
    	
    	if ( childVNode.nodeType === 11 ) {
        	foreach ( childVNode.children, child => {
            	this.children.push ( child );
            } );
        }
    	else {
    		this.children.push ( childVNode );
        }
    },
	
    /**
        removeChild ( childVNode: Object )
    
        Return Type:
        void
    
        Description:
        在此vnode下移除一个子vnode
    
        URL doc:
        http://icejs.org/######
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
                children = newVNode.children;

               	const args = [ i, 1 ].concat ( newVNode.children );
            	Array.prototype.splice.apply ( children, args );
            }
        	else {
                children = [ newVNode ];
        		this.children.splice ( i, 1, newVNode );
            }

            // 更换父节点
            foreach ( children, child => {
                changeParent ( child, this );
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
        http://icejs.org/######
    */
	insertBefore ( newVNode, existingVNode ) {
    	supportCheck ( this.nodeType, "insertBefore" );
    	
    	const i = this.children.indexOf ( existingVNode );
    	if ( i >= 0 ) {
            let children;
        	if ( newVNode.nodeType === 11 ) {
                children = newVNode.children;
            	Array.prototype.splice.apply ( children, [ i, 0 ].concat ( newVNode.children ) );
            }
        	else {
                children = [ newVNode ];
        		this.children.splice ( i, 0, newVNode );
            }

            // 更换父节点
            foreach ( children, child => {
                changeParent ( child, this );
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
        http://icejs.org/######
    */
    html ( vnode ) {
    	supportCheck ( this.nodeType, "html" );

        foreach ( this.children, child => {
            child.parent = null;
        } )

    	this.children = [ vnode ];
        changeParent ( vnode, this );
    },
	
	/**
        nextSibling ()
    
        Return Type:
        void
    
        Description:
        获取此vnode的下一个vnode
    
        URL doc:
        http://icejs.org/######
    */
	nextSibling () {
    	if ( this.parent ) {
        	return this.parent.children [ this.parent.children.indexOf ( this ) + 1 ];
        }
    },

    /**
        prevSibling ()
    
        Return Type:
        void
    
        Description:
        获取此vnode的下一个vnode
    
        URL doc:
        http://icejs.org/######
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
        http://icejs.org/######
    */
    attr ( name, val ) {
    	supportCheck ( this.nodeType, "attr" );
    	correctParam ( name, val ).to ( "string", [ "string", "object", null ] ).done ( function () {
			name = this.$1;
			val = this.$2;
		} );
  
		switch ( type ( val ) ) {
    		case "string":
        		this.attrs [ name ] = val;

        		break;
    		case "undefined":
        		return this.attrs [ name ];
    		case "object":
        		foreach ( val, ( v, k ) => {
            		this.attrs [ k ] = v;
            	} );

        		break;
    		case "null":
        		delete this.attrs [ name ];
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
        http://icejs.org/######
    */
    render () {
    	
        let f;
    	switch ( this.nodeType ) {
        	case 1:
        		if ( this.node === undefined ) {
        			this.node = document.createElement ( this.nodeName );
    				attr ( this.node, this.attrs );
         		}
            	
            	f = document.createDocumentFragment ();
    			foreach ( this.children, child => {
        			f.appendChild ( child.render () );
                } );
            	
            	this.node.appendChild ( f );
            	
            	break;
        	case 3:
            	if ( this.node === undefined ) {
        			this.node = document.createTextNode ( this.nodeValue || "" );
                }
            	
            	break;
        	case 11:
            	if ( this.node === undefined ) {
        			this.node = document.createDocumentFragment ();
                }
        		
            	f = document.createDocumentFragment ();
        		foreach ( this.children, child => {
        			f.appendChild ( child.render () );
        		} );
            	
            	this.node.appendChild ( f );

                break;
        }
    	
    	return this.node;
    },

    /**
        clone ()
    
        Return Type:
        Object
        此vnode的克隆vnode
    
        Description:
        克隆此vnode
        操作克隆的vnode不会影响此vnode
    
        URL doc:
        http://icejs.org/######
    */
    clone () {
        let vnode;
        
        switch ( this.nodeType ) {
        	case 1:

        		// 复制attrs
    			const attrs = {};
    			foreach ( this.attrs, ( attr, name ) => {
        			attrs [ name ] = attr;
        		} );

                vnode = VElement ( this.nodeName, attrs, null, null, this.node, this.isComponent );
                vnode.key = this.key;
            	
            	break;
        	case 3:
            	vnode = VTextNode ( this.nodeValue, null, this.node );
                vnode.key = this.key;
            	
            	break;
        	case 11:
            	vnode = VFragment ( null, this.elem );
        }

        if ( this.children ) {
            foreach ( this.children, child => {
                vnode.appendChild ( child.clone () );
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
        http://icejs.org/######
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
        http://icejs.org/######
    */
    diff ( oldVNode ) {

        const nodePatcher = new NodePatcher ();
    	if ( this.nodeType === 3 && oldVNode.nodeType === 3 ) {
        	if ( this.nodeValue !== oldVNode.nodeValue ) {
            	
            	// 文本节点内容不同时更新文本内容
                nodePatcher.replaceTextNode ( oldVNode, this.nodeValue );
            }
        }
    	else if ( this.nodeName === oldVNode.nodeName && this.key === oldVNode.key ) {
			if ( this.isComponent ) {
            	diffChildren ( this.componentNodes, oldVNode.componentNodes, nodePatcher );
            }
        	else {
            	
            	// 通过key对比出节点相同时
            	// 对比属性
        		diffAttrs ( this, oldVNode, nodePatcher );
        	
        		// 比较子节点
        		diffChildren ( this.children, oldVNode.children, nodePatcher );
            }
        }
		else {
        	
        	// 节点不同，直接替换
            nodePatcher.replaceNode ( this, oldVNode.node );
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
        http://icejs.org/######
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
        http://icejs.org/######
    */
	domToVNode ( dom ) {
    	
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