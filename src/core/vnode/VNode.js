import { newClassCheck } from "../../Class";
import { extend, foreach, type, guid } from "../../func/util";
import { vnodeErr } from "../../error";
import correctParam from "../../correctParam";
import event from "../../event/core";
import slice from "../../var/slice";
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
    diffAttrs ( newVnode: Object, oldVnode: Object, nodePatcher: Object )

    Return Type:
    void

    Description:
    对比新旧vnode的属性，将差异存入nodePatcher中

    URL doc:
    http://icejs.org/######
*/
function diffAttrs ( newVnode, oldVnode, nodePatcher ) {
	foreach ( newVnode.attrs, ( attr, name ) => {
        if ( oldVnode.attrs [ name ] !== attr ) {
            nodePatcher.reorderAttr ( newVnode, name, attr );
        }
    } );

    //找出移除的属性
    foreach ( oldVnode.attrs, ( attr, name ) => {
        if ( !newVnode.attrs.hasOwnProperty ( name ) ) {
            nodePatcher.removeAttr ( newVnode, name );
        }
    } );
}

/**
    diffChildren ( newChildren: Array, oldChildren: Array, nodePatcher: Object )

    Return Type:
    void

    Description:
    比较新旧节点的子节点，将差异存入nodePatcher中

    URL doc:
    http://icejs.org/######
*/
function diffChildren ( newChildren, oldChildren, nodePatcher ) {

    const oldChildrenCopy = oldChildren.concat ();
    let index, oldChild, removeIndex,
        offset = 0;

    foreach ( newChildren, ( child, i ) => {

        // 遍历旧子节点查看是否有移除的节点
        oldChild = oldChildren [ i + offset ];
        while ( oldChild && newChildren.indexOf ( oldChild ) === -1 ) {
            removeIndex = oldChildrenCopy.indexOf ( oldChild );
            
            nodePatcher.removeNode ( oldChild );
            oldListCopy.splice ( removeIndex, 1 );

            offset ++;
            oldChild = oldChildren [ i + offset ];
        }


        ////////////////////////////
        ////////////////////////////
        ////////////////////////////
        index = oldChildrenCopy.indexOf ( child );
        if ( index > -1 && index !== i ) {

            // 移动节点
            nodePatcher.moveNode ( child, index, i );

            oldChildrenCopy.splice ( index, 1 );
            oldChildrenCopy.splice ( i, 0, child );
        }
        else if ( index === -1 ) {

            // 增加节点
            nodePatcher.addNode ( child, i );

            oldChildrenCopy.splice ( i, 0, item );
        }
    } );

    // 当旧子节点数量比新子节点数量多时，表示上面循环中可能未全部对比出需移除的节点
    // 所以在这边补充剩余未对比的需移除的节点
    if ( newChildren.length + offset < oldChildren.length ) {

        index = newChildren.length;
        while ( oldChildren [ index ] ) {
            if ( newChildren.indexOf ( oldChildren [ index ] ) === -1 ) {

                removeIndex = oldChildren.indexOf ( oldList [ index ] );
                nodePatcher.removeNode ( oldChildren [ removeIndex ], removeIndex );
            }

            index ++;
        }
    }
}

/**
    VNode ( nodeType: Number, key: Number, parent: Object, node: DOMObject )

    Return Type:
    void

    Description:
    虚拟DOM类

    URL doc:
    http://icejs.org/######
*/
export default function VNode ( nodeType, key, parent, node ) {
	newClassCheck ( this, VNode );
	
	this.nodeType = nodeType;
	this.key = key;
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
    	this.children.splice ( this.children.indexOf ( oldVNode ), 1 );
    },

    replaceChild ( newVNode, oldVNode ) {
    	supportCheck ( this.nodeType, "replaceChild" );
    	
    	const i = this.children.indexOf ( oldVNode );
    	if ( i >= 0 ) {
        	if ( newVNode.nodeType === 11 ) {
               	const args = [ i, 1 ].concat ( newVNode.children );
            	Array.prototype.splice.apply ( children, args );
            }
        	else {
        		children.splice ( i, 1, newVNode );
            }
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
    	
    	const i = this.children.indexOf ( oldVNode );
    	if ( i >= 0 ) {
        	if ( newVNode.nodeType === 11 ) {
               	const args = [ i, 0 ].concat ( newVNode.children );
            	Array.prototype.splice.apply ( children, args );
            }
        	else {
        		children.splice ( i, 0, newVNode );
            }
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
    	this.children = [ vnode ];
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
            		context.setAttribute ( k, v );
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
        clone ( parent: Object )
    
        Return Type:
        Object
        此vnode的克隆vnode
    
        Description:
        克隆此vnode
        操作克隆的vnode不会影响此vnode
    
        URL doc:
        http://icejs.org/######
    */
    clone ( parent = null ) {
        let vnode;
        const children = [];
        
        switch ( this.nodeType ) {
        	case 1:

        		// 复制attrs
    			const 
        			attrs = {},
            		vnode = VElement ( this.nodeName, attrs, this.key, parent, children, this.node, this.isComponent );
    	
    			foreach ( this.attrs, ( attr, name ) => {
        			attrs [ name ] = attr;
        		} );
    	
    			foreach ( this.children, child => {
        			children.push ( child.copy ( vnode ) );
        		} );
            	
            	break;
        	case 3:
            	vnode = VTextNode ( this.nodeValue, this.key, parent, this.node );
            	
            	break;
        	case 11:
            	vnode = VFragment ( this.key, parent, children, this.elem );
                
            	foreach ( this.children, child => {
                    children.push ( child.copy ( vnode ) );
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
        diff ( oldVnode: Object )
    
        Return Type:
        Object
        此vnode与参数oldVnode对比后计算出的NodePatcher对象
    
        Description:
        此vnode与参数oldVnode进行对比，并计算出差异
    
        URL doc:
        http://icejs.org/######
    */
    diff ( oldVnode ) {

        const 
            nodePatcher = new NodePatcher (), 
            oldVnodeCopy = oldVnode.concat ();

    	if ( this.nodeType === 3 && oldVnode === 3 ) {
        	if ( this.nodeValue !== oldVnode.nodeValue ) {
            	// 文本节点内容不同时更新文本内容
                if ( this.nodeValue !== oldVnode.nodeValue ) {
                    nodePatcher.replaceTextNode ( this );
                }
            }
        }
    	else if ( this.nodeName === oldVnode.nodeName && this.key === oldVnode.key ) {

            // 通过key对比出节点相同时
            // 对比属性
        	diffAttrs ( this, oldVnode, nodePatcher );
        	
        	// 比较子节点
        	diffChildren ( this.children, oldVnode.children, nodePatcher );
        }
		else {
        	
        	// 节点不同，直接替换
            nodePatcher.replaceNode ( this );
        }
    },

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
	domToVNode ( dom, parent = null ) {
    	
    	const children = [];
        let vnode;

        switch ( dom.nodeType ) {
            case 1:
                vnode = VElement ( dom.nodeName, slice.call ( dom.attributes ), guid (), parent, children, dom );

                break;
            case 3:
                vnode = VTextNode ( dom.nodeValue, guid (), parent, dom );

                break;
            case 11:
                vnode = VFragment ( children, dom );
        }
    	
    	foreach ( slice.call ( dom.nodeName === "TEMPLATE" ? dom.content.childNodes || dom.childNodes : dom.childNodes ), childNode => {
        	children.push ( VNode.domToVNode ( childNode, vnode ) );
        } );
    	
    	return vnode;
    }
} );