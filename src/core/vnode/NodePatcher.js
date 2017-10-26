import { extend } from "../../func/util";
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
	reorderNode ( item, index ) {
		this.patches.push ( { type : NodePatcher.NODE_REORDER, item, index } );
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
	replaceTextNode ( item, val ) {
		this.patches.push ( { type : NodePatcher.TEXTNODE, item, val } );
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
                	patchItem.item.node.nodeValue = val;
            	
                	break;
                case NodePatcher.NODE_REORDER :
                	p = patchItem.item.node.parentNode;
                	if ( patchItem.index < p.childNodes.length - 1 ) {
            			p.insertBefore ( patchItem.item.node, p.childNodes.item ( patchItem.index + 1 ) );
                    }
                	else {
                    	p.appendChild ( patchItem.item.node );
                    }
                	
                	break;
                case NodePatcher.NODE_REMOVE :
                	patchItem.item.node.parentNode.removeChild ( patchItem.item.node );
            	
                	break;
                case NodePatcher.NODE_REPLACE :
            		patchItem.replaceNode.parentNode.replaceChild ( patchItem.item.node, patchItem.replaceNode );
                	
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