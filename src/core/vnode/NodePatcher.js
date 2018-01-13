import { extend, foreach, type } from "../../func/util";
import { attr } from "../../func/node";
import { attrAssignmentHook } from "../../var/const";
import event from "../../event/core";

/**
	walkTemplateNodes ( nodes: Array, callback: Function )

	Return Type:
	void

	Description:
	遍历vnode实例的node数组项
	当node数组项中有Array数组时继续遍历此数组
	回调函数为每项遍历的处理回调函数

	URL doc:
	http://amaple.org/######
*/
function walkTemplateNodes ( templateNodes, callback ) {
	foreach ( templateNodes, vnode => {
		if ( vnode.templateNodes ) {
			walkTemplateNodes ( vnode.templateNodes, callback );
		}
		else {
			callback ( vnode.node );
		}
	} );
}

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
		http://amaple.org/######
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
		http://amaple.org/######
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
		http://amaple.org/######
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
		http://amaple.org/######
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
		http://amaple.org/######
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
		http://amaple.org/######
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
		http://amaple.org/######
	*/
	removeAttr ( item, name ) {
		this.patches.push ( { type : NodePatcher.ATTR_REMOVE, item, name } );
	},

	/**
		addEvents ( item: Object, eventType: String, handlers: Array )
	
		Return Type:
		void
	
		Description:
		记录事件绑定的记录
	
		URL doc:
		http://amaple.org/######
	*/
	addEvents ( item, eventType, handlers ) {
		this.patches.push ( { type : NodePatcher.EVENTS_ADD, item, eventType, handlers } );
	},
	
	/**
		concat ()
	
		Return Type:
		void
	
		Description:
		合并NodePatcher内的diff步骤
	
		URL doc:
		http://amaple.org/######
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
		http://amaple.org/######
	*/
	patch () {
		let p;
		foreach ( this.patches, patchItem => {
        	switch ( patchItem.type ) {
              	case NodePatcher.ATTR_REORDER :
              		if ( attrAssignmentHook.indexOf ( patchItem.name ) === -1 ) {
              		    attr ( patchItem.item.node, patchItem.name, patchItem.val );
              		}
              		else {
              		    patchItem.item.node [ patchItem.name ] = patchItem.val;
              		}
                	
                	break;
                case NodePatcher.ATTR_REMOVE :
            		attr ( patchItem.item.node, patchItem.name, null );
                	
                	break;
                case NodePatcher.TEXTNODE :
                	patchItem.replaceNode.node.nodeValue = patchItem.item.nodeValue;
                	patchItem.item.node = patchItem.replaceNode.node;
            	
                	break;
                case NodePatcher.NODE_REORDER :
                	patchItem.item.render ();

                	p = patchItem.item.parent.node;
              		if ( patchItem.item.templateNodes ) {
                    	const f = document.createDocumentFragment ();
                    	walkTemplateNodes ( patchItem.item.templateNodes, node => {
                    		f.appendChild ( node );
                    	} );
                    	
                    	if ( patchItem.index < p.childNodes.length ) {

                    		// 在template或组件元素移动的情况下是先将移动的元素取出到fragment中，再根据对应位置将fragment插入，不同于普通元素的移动，故不需要+1
            				p.insertBefore ( f, p.childNodes.item ( patchItem.index ) );
                    	}
                		else {
                    		p.appendChild ( f );
                    	}
                    	
                    	// 移动操作的组件需调用组件的update生命周期函数
                    	if ( patchItem.isMove && patchItem.item.isComponent ) {
                        	patchItem.item.component.__update__ ();
                        }
                    }
                	else {
                		if ( patchItem.index < p.childNodes.length ) {
 							if ( patchItem.isMove ) {
 								p.removeChild ( patchItem.item.node );
 							}
            				p.insertBefore ( patchItem.item.node, p.childNodes.item ( patchItem.index ) );
                    	}
                		else {
                    		p.appendChild ( patchItem.item.node );
                    	}
                    }
                	
                	break;
                case NodePatcher.NODE_REMOVE :
                	let unmountNodes;
                	if ( patchItem.item.templateNodes ) {
                		walkTemplateNodes ( patchItem.item.templateNodes, node => {
                    		node.parentNode.removeChild ( node );
                    	} );
                    	
                    	// 移除的组件需调用unmount生命周期函数
                    	if ( patchItem.item.isComponent ) {
                    		patchItem.item.component.__unmount__ ();
                    	}
                    }
                	else {
                		patchItem.item.node.parentNode.removeChild ( patchItem.item.node );
                    }
                	
                	break;
                case NodePatcher.NODE_REPLACE :
                	patchItem.item.render ();

                	let node;
                	if ( patchItem.replaceNode.templateNodes ) {
                		p = patchItem.replaceNode.templateNodes [ 0 ].node.parentNode;

                    	if ( patchItem.item.templateNodes ) {
                        	node = document.createDocumentFragment ();
                        	foreach ( patchItem.item.templateNodes, vnode => {
                            	node.appendChild ( vnode.node );
                            } );
                        }
                    	else {
                        	node = patchItem.item.node;
                        }
                    	
                    	p.insertBefore ( node, patchItem.replaceNode.templateNodes [ 0 ].node );
                    	foreach ( patchItem.replaceNode.templateNodes, vnode => {
                        	p.removeChild ( vnode.node );
                        } );
                    }
                	else {
                		p = patchItem.replaceNode.node.parentNode;
                    	node = patchItem.item.node;
                    	if ( patchItem.item.templateNodes ) {
                        	node = document.createDocumentFragment ();
                        	foreach ( patchItem.item.templateNodes, vnode => {
                            	node.appendChild ( vnode.node );
                            } );
                        }
                    	
            			p.replaceChild ( node, patchItem.replaceNode.node );
                    }
                	
                	break;
                case NodePatcher.EVENTS_ADD : 
                	foreach ( patchItem.handlers, handler => {
                		event.on ( patchItem.item.node, patchItem.eventType, handler );
                	} );
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
    NODE_REPLACE : 5,

    // 添加事件绑定
    EVENTS_ADD : 6
} );