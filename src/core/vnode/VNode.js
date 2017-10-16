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

diffAttrs ( newAttrs, oldAttrs ) {
	
}

diffChildren ( newChildren, oldChildren ) {
	let oldIndex;
	const oldChildrenCopy = oldVnode.children.concat ();
	
	foreach ( this.children, ( child, i ) => {
		oldIndex = oldChildrenCopy.indexOf ( child );
		if ( oldIndex > -1 ) {
            if ( oldIndex !== i ) {
                // move child
                // ...
            	
                oldChildrenCopy.splice ( oldIndex, 1 );
				oldChildrenCopy.splice ( i, 0, child );
            }
            	
            // save child differences
        	const diff = child.diff ( oldChildrenCopy [ oldChildrenCopy ] );
		}
		else if ( oldIndex === -1 ) {
              
			// add the new child node
			// ...
            	
			oldChildCopy.splice ( i, 0, child );
		}
	} );

	foreach ( oldChildrenCopy, ( child, i ) => {
		if ( this.children.indexOf ( child ) <= -1 ) {
			// remove this node
            // ...
		}
	} );
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
    	
    	if ( childVNode.nodeType === 11 ) {
        	foreach ( childVNode.children, child => {
            	this.children.push ( child );
            } );
        }
    	else {
    		this.children.push ( childVNode );
        }
    },
	
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
        }
    },
	
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
        }
    },
    
    html ( vnode ) {
    	supportCheck ( this.nodeType, "html" );
    	this.children = [ vnode ];
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
    	
    	switch ( this.nodeType ) {
        	case 1:
        		if ( this.node === undefined ) {
        			this.node = document.createElement ( this.nodeName );
    				attr ( this.node, this.attrs );
         		}
            	
            	const f = document.createDocumentFragment ();
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
        		
            	const f = document.createDocumentFragment ();
        		foreach ( this.children, child => {
        			f.appendChild ( child.render () );
        		} );
            	
            	this.node.appendChild ( f );

                break;
        }
    	
    	return this.node;
    },

    clone ( parent = null ) {
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
    
    bindEvent ( type, listener ) {
    	this.events = this.events || {};
    	this.events [ type ] = this.events [ type ] || [];
    	
    	this.events [ type ].push ( listener );
    },

    diff ( oldVnode ) {
    	if ( this.nodeType === 3 && oldVnode === 3 ) {
        	if ( this.nodeValue !== oldVnode.nodeValue ) {
            	// change text
            	// ...
            }
        }
    	else if ( this.nodeName === oldVnode.nodeName && this.key === oldVnode.key ) {
            // diff attrs
        	diffAttrs ( this.attrs, oldVnode.attrs );
        	
        	// diff children
        	diffChildren ( this.children, oldVnode.children );
        }
		else {
        	// replace node
        	// ...
        	
        }
    },
} );

extend ( VNode, {
	domToVNode ( dom, parent = null ) {
    	
    	const 
        	children = [],
            vnode = new VNode ( dom.nodeName, dom.nodeType, slice.call ( dom.attributes ), guid (), parent, children, dom );
    	
    	foreach ( slice.call ( dom.nodeName === "TEMPLATE" ? dom.content.childNodes || dom.childNodes : dom.childNodes ), childNode => {
        	children.push ( VNode.domToVNode ( childNode, vnode ) );
        } );
    	
    	return vnode;
    }
} );