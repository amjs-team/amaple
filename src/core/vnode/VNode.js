import { newClassCheck } from "../../Class";
import { extend, foreach, type, guid } from "../../func/util";
import { vnodeErr } from "../../error";
import correctParam from "../../correctParam";
import slice from "../../var/slice";
import VElement from "./VElement";
import VTextNode from "./VTextNode";
import VFragment from "./VFragment";

supportCheck ( nodeType, method ) {
	if ( nodeType !== 1 && nodeType !== 11 ) {
    	throw vnodeErr ( "NotSupport", "此类型的虚拟节点不支持" + method + "方法" );
    }
}

export default function VNode ( nodeType, key, parent, node ) {
	newClassCheck ( this, VNode );
	
	this.nodeType = nodeType;
	this.key = key;
	this.parent = parent;
	this.node = node;
}

extend ( VNode.prototype, {
	appendChild ( childVNode ) {
    	supportCheck ( this.nodeType, "appendChild" );
    	this.children.push ( childVNode );
    },
	
	removeChild ( childVNode ) {
    	supportCheck ( this.nodeType, "removeChild" );
    	foreach ( this.children, ( child, i, children ) => {
        	if ( child === childVNode ) {
            	children.splice ( i, 1 );
            }
        } );
    },

    replaceChild ( newVNode, oldVNode ) {
    	supportCheck ( this.nodeType, "replaceChild" );
    	foreach ( this.children, ( child, i, children ) => {
        	if ( child === oldVNode ) {
            	children.splice ( i, 1, newVNode );
            }
        } );
    },
	
	//
	nextSibling () {
    	if ( this.parent ) {
        	return this.parent.children [ this.parent.children.indexOf ( this ) + 1 ];
        }
    },

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

    render () {
    	let node;
    	switch ( this.nodeType ) {
        	case 1:
        		node = this.node = document.createElement ( this.nodeName );
    			attr ( node, this.attrs );
    			foreach ( this.children, child => {
        			node.appendChild ( child.render () );
                } );
            	
            	break;
        	case 3:
        		node = this.node = document.createTextNode ( this.nodeValue || "" );
            	
            	break;
        	case 11:
        		node = this.node = document.createDocumentFragment ();
        		
        		foreach ( this.children, child => {
        			node.appendChild ( child.render () );
        		} );

                break;
        }
    	
    	return node;
    },

    copy ( parent = null ) {
        let vnode;
        
        switch ( this.nodeType ) {
        	case 1:

        		// 复制attrs
    			const 
        			attrs = {},
            		children = [],
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
                const children = [];
            	vnode = VFragment ( this.key, parent, children, this.elem );
                
            	foreach ( this.children, child => {
                    children.push ( child.copy ( vnode ) );
                } );
        }
    	
    	return vnode;
    },

    diff ( vnode ) {
    	
    },
} );

extend ( VNode, {
	domToVNode ( dom, parent = null ) {
    	
    	const 
        	children = [],
            vnode = new VNode ( dom.nodeName, dom.nodeType, slice.call ( dom.attributes ), guid (), parent, children, dom );
    	
    	foreach ( slice.call ( dom.nodeName === "TEMPLATE" ? dom.content.childNodes || dom.childNodes : dom.childNodes ), childNode => {
        	children.push ( childNode.nodeType === 3 ? childNode.nodeValue : VNode.domToVNode ( childNode, vnode ) );
        } );
    	
    	return vnode;
    }
} );