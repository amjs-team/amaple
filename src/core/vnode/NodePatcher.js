import { extend, foreach } from "../../func/util";
import { attr } from "../../func/node";

export default function NodePatcher () {
	this.patches = [];
}

extend ( NodePatcher.prototype, {

	/**
		reorderNode ( item: Object, index: Number )
	
		Return Type:
		void
	
		Description:
		记录需增加或移动节点的信息
	
		URL doc:
		http://icejs.org/######
	*/
	addNode ( item, index ) {
		this.patches.push ( { type : NodePatcher.NODE_REORDER, item, index } );
	},
	
	/**
		moveNode ( item: Object, index: Number )
	
		Return Type:
		void
	
		Description:
		记录需增加或移动节点的信息
	
		URL doc:
		http://icejs.org/######
	*/
	moveNode ( item, index ) {
		this.patches.push ( { type : NodePatcher.NODE_REORDER, item, index, isMove : true } );
	},

	/**
		replaceNode ( item: Object, replaceNode: Object )
	
		Return Type:
		void
	
		Description:
		记录替换节点的信息
	
		URL doc:
		http://icejs.org/######
	*/
	replaceNode ( item, replaceNode ) {
		this.patches.push ( { type : NodePatcher.NODE_REPLACE, item, replaceNode } );
	},

	/**
		removeNode ( item: Object )
	
		Return Type:
		void
	
		Description:
		记录移除节点的信息
	
		URL doc:
		http://icejs.org/######
	*/
	removeNode ( item ) {
		this.patches.push ( { type : NodePatcher.NODE_REMOVE, item } );
	},

	/**
		replaceTextNode ( item: Object, val: String )
	
		Return Type:
		void
	
		Description:
		记录修改文本节点的信息
	
		URL doc:
		http://icejs.org/######
	*/
	replaceTextNode ( item, replaceNode ) {
		this.patches.push ( { type : NodePatcher.TEXTNODE, item, replaceNode } );
	},

	/**
		reorderAttr ( item: Object, name: String, val: String )
	
		Return Type:
		void
	
		Description:
		记录重设或增加节点属性的信息
	
		URL doc:
		http://icejs.org/######
	*/
	reorderAttr ( item, name, val ) {
		this.patches.push ( { type : NodePatcher.ATTR_REORDER, item, name, val } );
	},

	/**
		removeAttr ( item: Object, name: String )
	
		Return Type:
		void
	
		Description:
		记录移除节点属性的记录
	
		URL doc:
		http://icejs.org/######
	*/
	removeAttr ( item, name ) {
		this.patches.push ( { type : NodePatcher.ATTR_REMOVE, item, name } );
	},
	
	/**
		concat ()
	
		Return Type:
		void
	
		Description:
		合并NodePatcher内的diff步骤
	
		URL doc:
		http://icejs.org/######
	*/
	concat ( nodePatcher ) {
    	this.patches = this.patches.concat ( nodePatcher.patches );
    },

	/**
		patch ()
	
		Return Type:
		void
	
		Description:
		根据虚拟节点差异更新视图
	
		URL doc:
		http://icejs.org/######
	*/
	patch () {
		let p;
		foreach ( this.patches, patchItem => {
        	switch ( patchItem.type ) {
              	case NodePatcher.ATTR_REORDER :
            		attr ( patchItem.item.node, patchItem.name, patchItem.val );
                	
                	break;
                case NodePatcher.ATTR_REMOVE :
            		attt ( patchItem.item.node, patchItem.name, null );
                	
                	break;
                case NodePatcher.TEXTNODE :
                	patchItem.replaceNode.node.nodeValue = patchItem.item.node.nodeValue;
                	patchItem.item.node = patchItem.replaceNode.node;
            	
                	break;
                case NodePatcher.NODE_REORDER :
                	p = patchItem.item.parent.node;
              		if ( patchItem.item.isComponent ) {
                    	const f = document.createDocumentFragment ();
                    	foreach ( patchItem.item.componentNodes, vnode => {
                        	f.appendChild ( vnode.node );
                        } );
                    	
                    	if ( patchItem.index < p.childNodes.length - 1 ) {
            				p.insertBefore ( f, p.childNodes.item ( patchItem.index + 1 ) );
                    	}
                		else {
                    		p.appendChild ( f );
                    	}
                    	
                    	if ( patchItem.isMove ) {
                        	patchItem.item.component.update ();
                        }
                    }
                	else {
                		if ( patchItem.index < p.childNodes.length - 1 ) {
            				p.insertBefore ( patchItem.item.node, p.childNodes.item ( patchItem.index + 1 ) );
                    	}
                		else {
                    		p.appendChild ( patchItem.item.node );
                    	}
                    }
                	
                	break;
                case NodePatcher.NODE_REMOVE :
                	if ( patchItem.item.isComponent ) {
                    	foreach ( patchItem.item.componentNodes, vnode => {
                        	vnode.parent.node.removeChild ( vnode.node );
                        } );
                    	
                    	patchItem.item.component.unmount ();
                    }
                	else {
                		patchItem.item.node.parentNode.removeChild ( patchItem.item.node );
                    }
                	
                	break;
                case NodePatcher.NODE_REPLACE :
                	p = patchItem.replaceNode.node.parentNode;
                	if ( patchItem.replaceNode.isComponent ) {
                    	let node;
                    	if ( patchItem.item.isComponent ) {
                        	node = document.createDocumentFragment ();
                        	foreach ( patchItem.item.componentNodes, vnode => {
                            	node.appendChild ( vnode.node );
                            } );
                        }
                    	else {
                        	node = patchItem.item.node;
                        }
                    	
                    	p.insertBefore ( node, patchItem.replaceNode.componentNodes [ 0 ].node );
                    	foreach ( patchItem.replaceNode.componentNodes, vnode => {
                        	p.removeChild ( vnode.node );
                        } );
                    	
                    	patchItem.replaceNode.component.unmount ();
                    }
                	else {
                    	let node;
                    	if ( patchItem.item.isComponent ) {
                        	node = document.createDocumentFragment ();
                        	foreach ( patchItem.item.componentNodes, vnode => {
                            	node.appendChild ( vnode.node );
                            } );
                        }
                    	
            			p.replaceChild ( node, patchItem.replaceNode.node );
                    }
                	
                	break;
            }
        } );
	}
} );

extend ( NodePatcher, {

	// 虚拟DOM差异标识
	// 属性差异标识
    ATTR_REORDER : 0,
    ATTR_REMOVE : 1,

    // 文本节点差异标识
    TEXTNODE : 2,

    // 节点增加或移动标识
    NODE_REORDER : 3,

    // 节点移除标识
    NODE_REMOVE : 4,

    // 节点替换标识
    NODE_REPLACE : 5
} );