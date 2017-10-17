import { extend } from "../../func/util";

export default function NodePatcher () {
	this.patches = [];
}

extend ( NodePatcher.prototype, {

	addNode ( item, index ) {
		this.patches.push ( { type : NodePatcher.ADD, item, index } );
	},

	moveNode ( item, from, to ) {
		this.patches.push ( { type : NodePatcher.MOVE, item, from, to } );
	},

	replaceNode ( item ) {
		this.patches.push ( { type : NodePatcher.REPLACE, item } );
	},

	removeNode ( item, index ) {
		this.patches.push ( { type : NodePatcher.REMOVE, item, index } );
	},

	replaceTextNode ( item ) {
		this.patches.push ( { type : NodePatcher.TEXT, item } );
	},

	reorderAttr ( item, name, val ) {
		this.patches.push ( { type : NodePatcher.REORDER_ATTR, item, name, val } );
	},

	removeAttr ( item, name ) {
		this.patches.push ( { type : NodePatcher.REMOVE_ATTR, item, name } );
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

	}
} );

extend ( NodePatcher, {

	// 虚拟DOM差异标识
	// 属性差异标识
    REORDER_ATTR : 0,

    REMOVE_ATTR : 1,

    // 文本节点差异标识
    TEXT : 2,

    // 节点移动标识
    MOVE : 3,

    // 节点增加标识
    ADD : 4,

    // 节点移除标识
    REMOVE : 5,

    // 节点替换标识
    REPLACE : 6
} );